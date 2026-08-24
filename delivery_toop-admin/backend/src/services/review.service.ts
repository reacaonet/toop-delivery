import { ReviewModel } from "../models/Review";
import { OrderModel } from "../models/Order";
import { CompanyModel } from "../models/Company";
import { DeliverymanModel } from "../models/Deliveryman";
import { AppError } from "../middleware/errorHandler";

export class ReviewService {
  async create(data: {
    orderId: string;
    customerId: string;
    rating: number;
    comment?: string;
    type: 'store' | 'deliveryman';
  }) {
    const order = await OrderModel.findById(data.orderId);
    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (order.status !== 'delivered') {
      throw new AppError("Só é possível avaliar pedidos entregues", 400);
    }

    if (order.customer.toString() !== data.customerId) {
      throw new AppError("Você só pode avaliar seus próprios pedidos", 403);
    }

    const existing = await ReviewModel.findOne({
      order: data.orderId,
      type: data.type,
      customer: data.customerId,
    });
    if (existing) {
      throw new AppError("Você já avaliou este pedido", 400);
    }

    const review = await ReviewModel.create({
      order: data.orderId,
      customer: data.customerId,
      company: order.company,
      deliveryman: order.deliveryman,
      rating: data.rating,
      comment: data.comment,
      type: data.type,
    });

    if (data.type === 'store') {
      const stats = await ReviewModel.aggregate([
        { $match: { company: order.company, type: 'store' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (stats.length > 0) {
        await CompanyModel.findByIdAndUpdate(order.company, {
          rating: Math.round(stats[0].avg * 10) / 10,
          totalReviews: stats[0].count,
        });
      }
    }

    if (data.type === 'deliveryman' && order.deliveryman) {
      const stats = await ReviewModel.aggregate([
        { $match: { deliveryman: order.deliveryman, type: 'deliveryman' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (stats.length > 0) {
        await DeliverymanModel.findByIdAndUpdate(order.deliveryman, {
          rating: Math.round(stats[0].avg * 10) / 10,
          totalReviews: stats[0].count,
        });
      }
    }

    return review;
  }

  async listByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ReviewModel.find({ company: companyId, type: 'store' })
        .populate('customer', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      ReviewModel.countDocuments({ company: companyId, type: 'store' }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async listByOrder(orderId: string) {
    return ReviewModel.find({ order: orderId }).populate('customer', 'name');
  }

  async getReviewableOrders(customerId: string) {
    const reviewedOrderIds = (
      await ReviewModel.find({ customer: customerId }).distinct('order')
    ).map(String);

    const orders = await OrderModel.find({
      customer: customerId,
      status: 'delivered',
      _id: { $nin: reviewedOrderIds },
    })
      .populate('company', 'name logo')
      .limit(10)
      .sort({ createdAt: -1 });

    return orders;
  }
}

export default new ReviewService();
