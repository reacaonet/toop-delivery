import { OrderModel } from "../models/Order";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  company?: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class OrderService {
  async create(data: {
    company: string;
    customer: string;
    items: Array<{ name: string; quantity: number; price: number; total: number }>;
    subtotal: number;
    total: number;
    paymentMethod: string;
    deliveryAddress: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      lat?: number;
      lng?: number;
    };
    notes?: string;
  }) {
    const orderNumber = `${Date.now()}${crypto.randomInt(1000).toString().padStart(3, "0")}`;

    const order = await OrderModel.create({
      ...data,
      orderNumber,
      status: "pending",
    });

    return order;
  }

  async getById(id: string) {
    const order = await OrderModel.findById(id).populate("company").populate("customer").populate("deliveryman");
    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }
    return order;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.company) {
      filter.company = query.company;
    }

    if (query.customer) {
      filter.customer = query.customer;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        const start = new Date(query.startDate);
        if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        if (!isNaN(end.getTime())) filter.createdAt.$lte = end;
      }
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }

    const [data, total] = await Promise.all([
      OrderModel.find(filter)
        .populate("company")
        .populate("customer")
        .populate("deliveryman")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      OrderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, status: string, deliverymanId?: string) {
    const order = await OrderModel.findById(id);
    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    const allowedTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["delivering", "cancelled"],
      delivering: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      throw new AppError(
        `Transição de status inválida: ${order.status} → ${status}`,
        400
      );
    }

    const updateData: any = { status };

    if (status === "delivering") {
      if (!deliverymanId) {
        throw new AppError("deliverymanId é obrigatório ao aceitar entrega", 400);
      }
      updateData.deliveryman = deliverymanId;
    }

    const updated = await OrderModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return updated;
  }

  async cancel(id: string) {
    const order = await OrderModel.findById(id);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (order.status === "cancelled") {
      throw new AppError("Pedido já está cancelado", 400);
    }

    if (order.status === "delivered") {
      throw new AppError("Não é possível cancelar pedido já entregue", 400);
    }

    order.status = "cancelled";
    await order.save();

    return order;
  }
}

export default new OrderService();
