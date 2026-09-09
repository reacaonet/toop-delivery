import { Types } from 'mongoose';
import { OrderModel } from '../models/Order';
import { OrderStatusModel } from '../models/OrderStatus';
import { AppError } from '../middleware/errorHandler';

export class ShoppingOrderService {
  async paginator(query: Record<string, any> = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));

    const filter: Record<string, any> = {};
    if (query.customer && Types.ObjectId.isValid(query.customer)) filter.customer = query.customer;
    if (query.company && Types.ObjectId.isValid(query.company)) filter.company = query.company;
    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

    const [data, total] = await Promise.all([
      OrderModel.find(filter)
        .populate('customer', 'name email')
        .populate('company', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      OrderModel.countDocuments(filter),
    ]);

    return { list: data, total };
  }

  async getById(id: string): Promise<any> {
    if (!id || !Types.ObjectId.isValid(id)) throw new AppError('Pedido inválido', 400);
    const order = await OrderModel.findById(id).populate('customer', 'name email').populate('company', 'name');
    if (!order) throw new AppError('Pedido não encontrado', 404);
    const statusHistory = await OrderStatusModel.find({ order: id }).sort({ createdAt: 1 }).limit(50);
    return { ...order.toJSON(), statusHistory };
  }

  async costFreight(id: string, body: Record<string, any> = {}) {
    if (!id || !Types.ObjectId.isValid(id)) throw new AppError('Pedido inválido', 400);
    const order = await OrderModel.findById(id);
    if (!order) throw new AppError('Pedido não encontrado', 404);

    if (body.deliveryFee !== undefined) {
      order.deliveryFee = Number(body.deliveryFee);
      order.total = Math.round(
        (order.subtotal + order.deliveryFee + Number(order.tip || 0) - Number(order.discount || 0)) * 100
      ) / 100;
      await order.save();
    }

    return {
      deliver: order.deliveryFee,
      deliveryFee: order.deliveryFee,
      subtotal: order.subtotal,
      total: order.total,
    };
  }

  async setDeliveryMode(id: string, mode: 'own' | 'online') {
    if (!id || !Types.ObjectId.isValid(id)) throw new AppError('Pedido inválido', 400);
    if (!['own', 'online'].includes(mode)) throw new AppError('Modo de entrega inválido', 400);
    const order = await OrderModel.findByIdAndUpdate(id, { deliveryMode: mode }, { new: true });
    if (!order) throw new AppError('Pedido não encontrado', 404);
    return order;
  }

  async getDeliveryMode(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) throw new AppError('Pedido inválido', 400);
    const order = await OrderModel.findById(id, 'deliveryMode company');
    if (!order) throw new AppError('Pedido não encontrado', 404);
    return { ownDelivery: order.deliveryMode === 'own', onlineDelivery: order.deliveryMode === 'online' };
  }

  async startScheduleOrder(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) throw new AppError('Pedido inválido', 400);
    const order = await OrderModel.findById(id);
    if (!order) throw new AppError('Pedido não encontrado', 404);

    const scheduleExists = order.schedule && Object.keys(order.schedule).length > 0;
    if (scheduleExists && order.status === 'pending') {
      order.status = 'confirmed';
      await order.save();
    }

    return order;
  }
}

export default new ShoppingOrderService();