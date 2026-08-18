import { PaymentModel } from "../models/Payment";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class PaymentService {
  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      PaymentModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      PaymentModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const payment = await PaymentModel.findById(id);
    if (!payment) {
      throw new AppError("Pagamento não encontrado", 404);
    }
    return payment;
  }
}

export default new PaymentService();
