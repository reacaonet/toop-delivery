import mongoose from 'mongoose';
import { QueueDeliveryManModel, QueueStatus } from '../models/QueueDeliveryMan';
import { DeliveryManOnlineModel } from '../models/DeliveryManOnline';
import { RaceCanceledModel } from '../models/RaceCanceled';
import { RaceHistoryModel, RaceStatus } from '../models/RaceHistory';
import { RegisterDeliveryManModel, RegisterDeliveryStatus } from '../models/RegisterDeliveryMan';
import { OrderModel } from '../models/Order';
import { AppError } from '../middleware/errorHandler';

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.isValidObjectId(id);
}

export class DeliveryDispatchService {
  // ---------------- QUEUE ----------------
  async queueList(query: any) {
    const limitDefault = 50;
    const {
      limit,
      status,
      sortData,
      dateLt,
      rangeAttempt,
      attemptGte,
      seconds,
      order,
    } = query;

    const filter: any = {};
    const sort: any = { createdAt: 1 };

    let limitList = limit ? Number(limit) : limitDefault;

    if (order) filter.order = order;
    if (status) filter.status = status;

    if (dateLt) {
      filter.lastData = { $lt: new Date(dateLt) };
    } else if (seconds) {
      filter.lastData = { $lt: new Date(Date.now() - Number(seconds) * 1000) };
    }

    if (rangeAttempt) {
      const paramsRange = String(rangeAttempt).split(',', 2);
      if (paramsRange && paramsRange.length > 0) {
        filter.attempt = { $gte: Number(paramsRange[0]), $lt: Number(paramsRange[1]) };
      }
    } else if (attemptGte) {
      filter.attempt = { $gte: Number(attemptGte) };
    }

    if (sortData) sort.createdAt = Number(sortData) || 1;

    return QueueDeliveryManModel.find(filter)
      .populate('company', 'name')
      .populate('order', 'deliveryAddress')
      .limit(limitList)
      .sort(sort)
      .lean();
  }

  async queueStatusOne(status: string, initial?: string) {
    if (!status) throw new AppError('Informe um Status', 400);

    const filter: any = { status };

    if (initial && initial.toString() === 'true') {
      filter.attempt = { $eq: 0 };
      filter.$or = [{ lastData: { $exists: false } }, { lastData: { $eq: null } }];
    }

    return QueueDeliveryManModel.findOne(filter)
      .populate('company', 'name')
      .populate('order', 'deliveryAddress')
      .sort({ createdAt: 1 })
      .lean();
  }

  async queueUpdateStatus(queueId: string, status: string) {
    if (!queueId || !isValidId(queueId)) throw new AppError('Informe uma fila válida', 400);
    if (!status) throw new AppError('Informe um Status', 400);

    const response = await QueueDeliveryManModel.findByIdAndUpdate(
      queueId,
      { status },
      { new: true }
    );

    if (!response) throw new AppError('Não foi possível alterar informações', 400);
    return response;
  }

  async queueUpdate(queueId: string, data: any) {
    if (!queueId || !isValidId(queueId)) throw new AppError('Informe uma fila válida', 400);

    const { attempt, deliveryMan, lastData, deliveryManProcess, historicDeliveryMan, status, sendToDeliveryMan } = data;

    if (!attempt || !historicDeliveryMan || !deliveryManProcess) {
      throw new AppError('Informe todos os campos necessários para atualizar a fila', 400);
    }

    const updateData: any = {
      attempt,
      historicDeliveryMan,
      deliveryManProcess,
    };

    if (status) updateData.status = status;
    if (lastData) updateData.lastData = lastData;
    if (deliveryMan) updateData.deliveryMan = deliveryMan;
    if (sendToDeliveryMan) updateData.sendToDeliveryMan = sendToDeliveryMan;

    const response = await QueueDeliveryManModel.findByIdAndUpdate(queueId, updateData, { new: true });
    if (!response) throw new AppError('Fila não encontrada', 404);
    return response;
  }

  async queueUpdateReceived(orderId: string, deliveryMan: string) {
    if (!orderId || !isValidId(orderId)) throw new AppError('Informe um pedido válido', 400);
    if (!deliveryMan || !isValidId(deliveryMan)) throw new AppError('Informe um delivery válido', 400);

    const queue = await QueueDeliveryManModel.findOne({ order: orderId }).lean();
    if (!queue) throw new AppError('Informe um pedido válido', 400);

    const received = queue.notificationReceived || [];
    received.push(new mongoose.Types.ObjectId(deliveryMan) as any);

    await QueueDeliveryManModel.updateOne({ _id: queue._id }, { notificationReceived: received });
    return { message: 'Atualizado com sucesso' };
  }

  async queueHaveActive(orderId: string) {
    const isActive = await QueueDeliveryManModel.findOne({
      order: orderId,
      status: QueueStatus.FINISH,
    })
      .select({ order: 1, status: 1 })
      .populate('order', 'status')
      .lean();

    let notFound = false;
    if (isActive && (isActive.order as any)?.status === 'WAIT_DELIVERYMAN') {
      notFound = true;
    }

    return { notFound };
  }

  async backToQueue(order: string, deliveryMan?: string) {
    if (!order || !isValidId(order)) throw new AppError('Pedido não encontrado', 400);

    const update: any = {
      attempt: 0,
      status: QueueStatus.WAIT,
      deliveryManProcess: [],
    };

    if (deliveryMan && isValidId(deliveryMan)) {
      update.sendToDeliveryMan = deliveryMan;
    } else {
      deliveryMan = undefined;
    }

    const result = await QueueDeliveryManModel.findOneAndUpdate({ order }, update, { new: true });

    await OrderModel.updateOne(
      { _id: order },
      { $set: { status: 'pending' }, $unset: { deliveryman: '' } }
    );

    if (!result) throw new AppError('Fila do pedido não encontrada', 404);
    return result;
  }

  // ---------------- ONLINE ----------------
  async onlineCreate(data: { deliveryMan: string }) {
    if (!data.deliveryMan || !isValidId(data.deliveryMan)) {
      throw new AppError('Informe um entregador válido', 400);
    }

    const created = await DeliveryManOnlineModel.create({
      deliveryMan: data.deliveryMan,
      online: new Date(),
      offline: null,
    });

    return { status: 200, message: 'Entregador Online', data: created };
  }

  async onlineOffline(deliveryMan: string) {
    if (!deliveryMan || !isValidId(deliveryMan)) throw new AppError('Informe um entregador válido', 400);

    const record = await DeliveryManOnlineModel.findOne({ deliveryMan, offline: null });
    if (!record) throw new AppError('Não foi possível encontrar um registro', 400);

    const offline = new Date();
    const total = Math.round((offline.getTime() - record.online.getTime()) / 60000);

    const response = await DeliveryManOnlineModel.findOneAndUpdate(
      { _id: record._id },
      { online: record.online, offline, total },
      { new: true, upsert: true }
    );

    return response;
  }

  async onlineListLastWeek(deliveryMan: string, query: any) {
    if (deliveryMan && !mongoose.Types.ObjectId.isValid(deliveryMan)) {
      throw new AppError('Id inválido', 400);
    }

    const pageIn = parseInt(query.pageIn || '0', 10);
    const pageOut = parseInt(query.pageOut || '10', 10);

    const start = new Date(Date.now() - 7 * 86400000);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const filter: any = {
      deliveryMan: new mongoose.Types.ObjectId(deliveryMan),
      online: { $gte: start, $lte: end },
    };

    const list = await DeliveryManOnlineModel.find(filter)
      .limit(pageOut)
      .skip(pageIn * pageOut)
      .lean();

    const totalMedia = await DeliveryManOnlineModel.aggregate([
      { $match: { ...filter, total: { $gt: 0 } } },
      {
        $group: {
          _id: '$deliveryMan',
          totalTime: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          totalTime: 1,
          count: 1,
          mediaTime: { $divide: ['$totalTime', 7] },
        },
      },
    ]);

    return { list, totalMedia };
  }

  // ---------------- RACE ----------------
  async raceCanceled(data: { deliveryMan: string; order: string; date: string }) {
    const { deliveryMan, order, date } = data;
    if (!order) throw new AppError('Informe o id da ordem que foi cancelada', 400);
    if (!deliveryMan) throw new AppError('Informe o id do entregador', 400);
    if (!date) throw new AppError('Informe a data do cancelamento', 400);

    const created = await RaceCanceledModel.create({ deliveryMan, order, date: new Date(date) });
    return { status: 200, message: 'Cancelamento de entrega registrado', data: created };
  }

  async raceCanceledList(order: string, all?: string) {
    if (!order) throw new AppError('Falha ao encontrar a corrida cancelada', 400);

    const filter = { order };
    if (all === 'true') {
      return RaceCanceledModel.find(filter).lean();
    }
    return RaceCanceledModel.findOne(filter).lean();
  }

  async raceHistory(data: any) {
    const { deliveryMan, order, statusRace } = data;
    if (!deliveryMan || !isValidId(deliveryMan)) throw new AppError('delivery-man inválido', 400);
    if (!order || !isValidId(order)) throw new AppError('order inválido', 400);
    if (!statusRace) throw new AppError('order inválido', 400);

    const response = await OrderModel.findById(order).populate('company', 'name address').lean();
    if (!response) throw new AppError('order inválido', 400);

    const history = await RaceHistoryModel.create({
      deliveryMan,
      order,
      company: (response.company as any)?._id,
      companyName: (response.company as any)?.name || '',
      companyAddress: (response.company as any)?.address,
      paymentPriceDelivery: response.deliveryFee,
      statusRace,
    });

    return history;
  }

  async deliveryPrice(orderId: string) {
    const order = await OrderModel.findById(orderId).lean();
    if (!order) throw new AppError('Pedido não encontrado', 404);

    return {
      _id: order._id,
      payment: {
        priceDelivery: order.deliveryFee || 0,
      },
    };
  }

  // ---------------- REGISTER DELIVERYMAN ----------------
  async registerCreate(data: any) {
    const { name, cpf, celphone, email, city, city_id, state, state_id, imageSelfie, imagesCnh, imagesDocuments, vehicleType, status, location } = data;

    let coordinate: any = undefined;
    if (location && location.lat) {
      coordinate = {
        type: 'Point',
        coordinates: [Number(location.lng), Number(location.lat)],
      };
    }

    const existing = await RegisterDeliveryManModel.findOne({ cpf });

    if (existing) {
      return RegisterDeliveryManModel.findByIdAndUpdate(
        existing._id,
        {
          name, cpf, celphone, email, city, city_id, state, state_id, imageSelfie,
          imagesCnh, imagesDocuments, vehicleType, status, location: coordinate,
        },
        { new: true }
      );
    }

    return RegisterDeliveryManModel.create({
      name, cpf, celphone, email, city, city_id, state, state_id, imageSelfie,
      imagesCnh, imagesDocuments, vehicleType, status: status || RegisterDeliveryStatus.PENDING,
      location: coordinate,
    });
  }

  async registerList() {
    return RegisterDeliveryManModel.find().lean();
  }

  async registerPaginator(query: any) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10)));
    const [data, total] = await Promise.all([
      RegisterDeliveryManModel.find().skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      RegisterDeliveryManModel.countDocuments(),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async registerUpdateStatus(id: string, body: { status?: string; message?: string }) {
    const response = await RegisterDeliveryManModel.findByIdAndUpdate(
      id,
      { status: body.status, message: body.message },
      { new: true }
    );
    if (!response) throw new AppError('Registro não encontrado', 404);
    return response;
  }
}

export default new DeliveryDispatchService();
