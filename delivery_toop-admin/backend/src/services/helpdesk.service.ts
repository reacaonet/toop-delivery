import { HelpTicketModel } from "../models/HelpTicket";
import { TicketInteractionModel } from "../models/TicketInteraction";
import { FaqModel } from "../models/Faq";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
  company?: string;
  status?: string;
  q?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export class HelpDeskService {
  // ---------- Tickets ----------
  async createTicket(data: any) {
    const ticket = await HelpTicketModel.create(data);
    // cria interação inicial automaticamente (como no legado)
    const origin = data.name ? "user" : "company";
    const author = data.name ? data.name : (data.companyName || "");
    await TicketInteractionModel.create({
      helpTicketsId: ticket._id,
      origin,
      description: data.description || "",
      author,
    });
    return this.getTicket(ticket._id.toString());
  }

  async listTickets(query: PaginationQuery) {
    const { page, limit, skip } = parsePagination(query);
    const filter: any = { deletedAt: { $exists: false } };
    if (query.company) filter.company = query.company;
    if (query.status) filter.status = query.status;
    if (query.q) {
      filter.$or = [
        { tickedId: { $regex: query.q, $options: 'i' } },
        { subject: { $regex: query.q, $options: 'i' } },
        { name: { $regex: query.q, $options: 'i' } },
        { email: { $regex: query.q, $options: 'i' } },
      ];
    }
    const [data, total] = await Promise.all([
      HelpTicketModel.find(filter)
        .populate('company', 'name')
        .populate('person', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      HelpTicketModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getTicket(id: string) {
    const ticket = await HelpTicketModel.findById(id)
      .populate('company', 'name')
      .populate('person', 'name email');
    if (!ticket) throw new AppError("Ticket não encontrado", 404);
    return ticket;
  }

  async getTicketByProtocol(protocol: string) {
    const ticket = await HelpTicketModel.findOne({ tickedId: protocol })
      .populate('company', 'name')
      .populate('person', 'name email');
    if (!ticket) throw new AppError("Protocolo não encontrado", 404);
    const interactions = await TicketInteractionModel.find({ helpTicketsId: ticket._id }).sort({ createdAt: -1 });
    const raw = ticket.toObject();
    const { __v: _v, ...rest } = raw;
    return { ...rest, interactions };
  }

  async listTicketInteractions(ticketId: string) {
    const ticket = await HelpTicketModel.findById(ticketId);
    if (!ticket) throw new AppError("Ticket não encontrado", 404);
    return TicketInteractionModel.find({ helpTicketsId: ticketId }).sort({ createdAt: -1 });
  }

  async updateTicket(id: string, data: any) {
    const ticket = await HelpTicketModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!ticket) throw new AppError("Ticket não encontrado", 404);
    return ticket;
  }

  async deleteTicket(id: string) {
    const ticket = await HelpTicketModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!ticket) throw new AppError("Ticket não encontrado", 404);
    return ticket;
  }

  async createInteraction(data: any) {
    return TicketInteractionModel.create(data);
  }

  async updateInteraction(id: string, data: any) {
    const doc = await TicketInteractionModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("Interação não encontrada", 404);
    return doc;
  }

  async deleteInteraction(id: string) {
    const doc = await TicketInteractionModel.findByIdAndDelete(id);
    if (!doc) throw new AppError("Interação não encontrada", 404);
    return doc;
  }

  // ---------- FAQ ----------
  async listFaqs(query: PaginationQuery) {
    const filter: any = {};
    if (query.status === 'true') filter.status = true;
    if (query.status === 'false') filter.status = false;
    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      FaqModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FaqModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getFaq(id: string) {
    const doc = await FaqModel.findById(id);
    if (!doc) throw new AppError("FAQ não encontrada", 404);
    return doc;
  }

  async createFaq(data: any) {
    const payload: any = { ...data };
    if (payload.status === '' || payload.status === null || payload.status === undefined) {
      payload.status = false;
    }
    return FaqModel.create(payload);
  }

  async updateFaq(id: string, data: any) {
    const doc = await FaqModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError("FAQ não encontrada", 404);
    return doc;
  }

  async deleteFaq(id: string) {
    const doc = await FaqModel.findByIdAndDelete(id);
    if (!doc) throw new AppError("FAQ não encontrada", 404);
    return doc;
  }
}

export default new HelpDeskService();
