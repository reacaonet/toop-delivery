import mongoose from 'mongoose';
import { PassengerModel } from '../models/Passenger';
import { PersonModel } from '../models/Person';
import { FranchiseModel } from '../models/Franchise';
import { BookingModel } from '../models/Booking';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const activeFilter = { deletedAt: { $exists: false } };

export class PassengerService {
  async listAll() {
    return PassengerModel.find(activeFilter).populate('person').populate('franchise');
  }

  async list(query: any) {
    const { id } = query;
    const { status } = query;

    if (id && !isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }

    const filter: any = { ...activeFilter };
    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== 'all') {
      filter.status = { $eq: true };
    }

    if (id) {
      const item: any = await PassengerModel.findOne({ _id: id, ...filter }).lean();
      if (!item) {
        throw new AppError('Passageiro não encontrado', 404);
      }
      if (item._id && !item.referralCode) {
        const code = generateReferralCode();
        await PassengerModel.updateOne({ _id: id }, { referralCode: code });
        await PersonModel.updateOne({ _id: item.person }, { referralCode: code });
        item.referralCode = code;
      }
      return item;
    }
    return PassengerModel.find(filter).populate('person').populate('franchise');
  }

  async paginator(query: any) {
    const { pageIn, pageOut, franchise, person } = query;
    const filter: any = { ...activeFilter };

    if (franchise && isObjectId(franchise)) {
      filter.franchise = franchise;
    }
    if (person && isObjectId(person)) {
      filter.person = person;
    }

    if ((pageIn || pageIn === 0) && pageOut) {
      const from = parseInt(pageIn, 10);
      const size = parseInt(pageOut, 10);
      if (Number.isNaN(from) || Number.isNaN(size)) {
        throw new AppError('Dados da paginação inválidos', 400);
      }
      const list = await PassengerModel.find(filter)
        .populate('franchise')
        .populate('person')
        .skip(from * size)
        .limit(size);
      const total = await PassengerModel.find(filter).countDocuments();
      return { list, total };
    }

    return PassengerModel.find(filter);
  }

  async search(query: any) {
    const { person, franchise } = query;
    const or: any[] = [];

    if (person) {
      or.push({ person });
    }
    if (franchise) {
      or.push({ franchise });
    }

    if (!or.length) {
      throw new AppError('Filtro é obrigatório', 400);
    }

    return PassengerModel.find({ $or: or, ...activeFilter }).lean();
  }

  /** Filtro que busca pessoas (Person) e vincula registros de passageiro. */
  async filter(query: any) {
    const { name = '' } = query || {};
    const filter: any = {};
    const filterPassenger: any = { 'passenger._id': { $exists: true } };

    if (name && typeof name === 'string' && name.trim().length > 0) {
      filter['$or'] = [
        { name: { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' } },
        { email: { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' } },
      ];
    }

    return PersonModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'passenger',
          let: { person: '$_id' },
          as: 'passenger',
          pipeline: [
            { $match: { $expr: { $eq: ['$person', '$$person'] } } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$passenger', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'franchise',
          let: { franchise: '$franchise' },
          as: 'franchise',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$franchise'] } } },
            { $project: { name: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
      { $project: { devices: 0, topics: 0 } },
      { $match: filterPassenger },
      { $limit: 10 },
    ]);
  }

  /** Gráfico agrupado por dia/status, replicando o legacy. */
  async graphic() {
    const timezone = 'America/Sao_Paulo';

    const list: any[] = await PassengerModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: { date: '$createdAt', timezone } },
            day: { $dayOfMonth: { date: '$createdAt', timezone } },
            year: { $year: { date: '$createdAt', timezone } },
          },
          enable: { $sum: { $cond: ['$status', 1, 0] } },
          disabled: { $sum: { $cond: ['$status', 0, 1] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]).limit(14);

    const total: any[] = await PassengerModel.aggregate([
      {
        $group: {
          _id: 'id',
          enable: { $sum: { $cond: ['$status', 1, 0] } },
          disabled: { $sum: { $cond: ['$status', 0, 1] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    if (!total || total.length <= 0) {
      return [];
    }

    const newList: any[] = [];
    let setEnable = total[0].enable;
    let setDisabled = total[0].disabled;
    let setTotal = total[0].total;

    list.forEach((graph, i) => {
      if (i === 0) {
        newList.push({
          _id: { month: graph._id.month, day: graph._id.day, year: graph._id.year },
          enable: setEnable,
          disabled: setDisabled,
          total: setTotal,
        });
      } else {
        setEnable = setEnable - graph.enable;
        setDisabled = setDisabled - graph.disabled;
        setTotal = setTotal - graph.total;
        newList.push({
          _id: { month: graph._id.month, day: graph._id.day, year: graph._id.year },
          enable: setEnable,
          disabled: setDisabled,
          total: setTotal,
        });
      }
    });

    return newList;
  }

  async create(data: any) {
    const body: any = { ...data };
    body.status = true;

    if (!body.person || !isObjectId(body.person)) {
      throw new AppError('Informe uma pessoa válida', 400);
    }

    const code = generateReferralCode();
    body.referralCode = code;

    const personCurrent: any = await PassengerModel.findOne({ person: body.person }).lean();
    if (personCurrent && personCurrent._id) {
      return personCurrent;
    }

    const item: any = await PassengerModel.create(body);

    await PersonModel.updateOne({ _id: body.person }, { referralCode: code });

    if (body.code) {
      await this.createIndication(item, body.code, 20);
    }

    return item;
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const body: any = { ...data };

    if (`${body.status}` === 'true' || `${body.status}` === 'false') {
      body.status = `${body.status}` === 'true';
    } else {
      delete body.status;
    }

    const updated = await PassengerModel.findOneAndUpdate({ _id: id }, body, {
      upsert: true,
      new: true,
    });
    if (!updated) {
      throw new AppError('Passageiro não encontrado', 404);
    }

    if (body.person && typeof body.person === 'object' && body.person._id) {
      const personData: any = { ...body.person };
      delete personData._id;
      await PersonModel.updateOne({ _id: body.person._id }, personData);
    }

    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const removed = await PassengerModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!removed) {
      throw new AppError('Registro não encontrado', 404);
    }
    return removed;
  }

  /** Corrida ativa do passageiro. */
  async activeRun(passenger: string) {
    if (!isObjectId(passenger)) {
      throw new AppError('Id do passageiro inválido', 400);
    }

    const response: any = await BookingModel.findOne({
      $or: [{ client: passenger }, { passenger }],
      status: { $in: ['matching', 'accepted', 'in_progress', 'waiting'] },
    })
      .populate({
        path: 'driver',
        select: {
          _id: 1,
          name: 1,
          vehicleManufacturer: 1,
          vehicleModel: 1,
          vehicleNameplate: 1,
          driverScoreAndName: 1,
          stars: 1,
          location: 1,
          selfiePhoto: 1,
          ddi: 1,
          phone: 1,
        },
      })
      .populate({ path: 'franchise', select: { showPhoneRace: 1 } })
      .populate({ path: 'service', select: { type: 1, showArrivalTime: 1 } })
      .sort({ createdAt: -1 })
      .lean();

    if (response && response.createdAt) {
      const now = Date.now();
      const created = new Date(response.createdAt).getTime();
      response.time = Math.floor((now - created) / 1000);
    }

    return response;
  }

  /** Vincula um passageiro a uma franquia pela localização. */
  async linkToFranchise(body: any) {
    const { passenger, person, latitude, longitude, token } = body || {};

    if (!latitude || !longitude || latitude === '0' || longitude === '0') {
      throw new AppError('Informe uma coordenada válida', 400);
    }

    const franchise = await FranchiseModel.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
        },
      },
      ...activeFilter,
    }).select({ _id: 1 });

    const passengerData: any = passenger
      ? await PassengerModel.findById(passenger).select({ token: 1, franchise: 1 }).lean()
      : null;

    if (franchise && franchise._id) {
      if (passenger) {
        await PassengerModel.updateOne(
          { _id: passenger },
          { franchise: `${franchise._id}`.toString() },
        );
      }
      if (person) {
        await PersonModel.updateOne(
          { _id: person },
          { franchise: `${franchise._id}`.toString() },
        );
      }

      if (!passengerData || `${franchise._id}`.toString() !== `${passengerData?.franchise}`.toString()) {
        await this.removeUserFromTopic(passengerData, 'passenger', token);
      }
    }

    return franchise;
  }

  private async createIndication(passenger: any, code: string, total = 5) {
    try {
      const isPassenger: any = await PassengerModel.findOne({ referralCode: code })
        .select({ _id: 1 })
        .lean();
      if (!isPassenger || !isPassenger._id) {
        return;
      }
      const model = mongoose.models['Indication'];
      if (model) {
        await model.create({
          passenger: passenger._id,
          referralCode: code,
          total,
        });
      }
    } catch {
      return null;
    }
  }

  private async removeUserFromTopic(user: any, type: string, _token?: string) {
    try {
      const model = mongoose.models['NotificationTopic'];
      if (model && user) {
        const removeChild = (model as any).removeUserFromTopic || (model as any).remove;
        if (typeof removeChild === 'function') {
          await removeChild(user, type, null);
        }
      }
    } catch {
      return;
    }
  }
}

export default new PassengerService();
