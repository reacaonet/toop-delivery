import { EmailTypeModel } from "../models/EmailType";
import { EmailTemplateModel } from "../models/EmailTemplate";
import { EmailVariableModel } from "../models/EmailVariable";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
}

function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

function normalizeStatus(data: any) {
  const payload = { ...data };
  if (payload.status === '' || payload.status === null || payload.status === undefined) {
    payload.status = false;
  }
  return payload;
}

export class EmailService {
  // ---------- Types ----------
  async listTypes(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      EmailTypeModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      EmailTypeModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async createType(data: any) {
    return EmailTypeModel.create(normalizeStatus(data));
  }

  async updateType(id: string, data: any) {
    return EmailTypeModel.findOneAndUpdate({ _id: id }, normalizeStatus(data), { upsert: true, new: true, runValidators: true });
  }

  async deleteType(id: string) {
    const doc = await EmailTypeModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!doc) throw new AppError("Tipo de e-mail não encontrado", 404);
    return doc;
  }

  // ---------- Templates ----------
  async listTemplates(query: PaginationQuery) {
    const filter: any = { deletedAt: { $exists: false } };
    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      EmailTemplateModel.find(filter).populate('type').populate('company', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      EmailTemplateModel.countDocuments(filter),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async createTemplate(data: any) {
    return EmailTemplateModel.create(normalizeStatus(data));
  }

  async updateTemplate(id: string, data: any) {
    return EmailTemplateModel.findOneAndUpdate({ _id: id }, normalizeStatus(data), { upsert: true, new: true, runValidators: true }).populate('type').populate('company', 'name');
  }

  async deleteTemplate(id: string) {
    const doc = await EmailTemplateModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!doc) throw new AppError("Template de e-mail não encontrado", 404);
    return doc;
  }

  // ---------- Variables (somente listagem, como no legado) ----------
  async listVariables() {
    return EmailVariableModel.find({ deletedAt: { $exists: false } }).sort({ name: 1 });
  }
}

export default new EmailService();
