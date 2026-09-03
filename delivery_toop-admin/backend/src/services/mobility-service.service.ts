import mongoose from 'mongoose';
import { ServiceModel } from '../models/Service';
import { FranchiseModel } from '../models/Franchise';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

const activeFilter = { deletedAt: { $exists: false } };

export class MobilityServiceService {
  async listAll() {
    return ServiceModel.find(activeFilter);
  }

  async list(query: any) {
    const { id, name, franchise = null } = query || {};
    const filter: any = { ...activeFilter };

    if (id) {
      if (!isObjectId(id)) {
        throw new AppError('Id inválido', 400);
      }
      filter._id = id;
    }
    if (franchise) {
      filter.franchise = franchise;
    }
    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = { $regex: '.*' + decodeName.toLowerCase() + '.*', $options: 'i' };
    }

    if (filter._id) {
      return ServiceModel.findOne(filter).populate('franchise');
    }
    return ServiceModel.find(filter);
  }

  async listById(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const item = await ServiceModel.findOne({ _id: id, ...activeFilter }).populate('franchise');
    if (!item) {
      throw new AppError('Serviço não encontrado', 404);
    }
    return item;
  }

  async listFront(query: any) {
    const { isRoot, franchises } = query;
    const { franchiseId = null } = query;

    if (isRoot) {
      return ServiceModel.find({
        franchise: franchiseId || undefined,
        ...activeFilter,
      }).populate({ path: 'franchise', select: { name: 1 } });
    }

    if (!franchises || !Array.isArray(franchises) || franchises.length <= 0) {
      return [];
    }

    const filter: any = { ...activeFilter };
    filter.franchise = { $in: franchises };

    return ServiceModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'franchise',
          let: { franchiseId: '$franchise' },
          as: 'franchise',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$franchiseId'] } } },
            { $project: { name: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
    ]);
  }

  /** Serviços disponíveis (validados) para uma busca de corrida. */
  async available(query: any) {
    const {
      person,
      driver = null,
      serviceType = null,
      franchise,
      longitude,
      latitude,
    } = query || {};

    const filter: any = { status: true, ...activeFilter };

    if (driver && isObjectId(driver)) {
      const driverResp = await anyModelFindOneById('Driver', driver, ['services']);
      if (driverResp && driverResp.services) {
        filter._id = { $in: driverResp.services };
      }
    }

    if (franchise && isObjectId(franchise)) {
      filter.franchise = new mongoose.Types.ObjectId(franchise);
    } else if (latitude && longitude) {
      const franchiseDoc = await FranchiseModel.findOne({
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
      if (franchiseDoc && franchiseDoc._id) {
        filter.franchise = franchiseDoc._id;
      }
    }

    if (serviceType && `${serviceType}`.length > 2) {
      filter.type = serviceType;
    }

    const femaleOnlyFilter = { onlyForWomen: { $ne: true } };
    if (person) {
      const personDoc = await anyModelFindOneById('Person', person, ['genre']);
      if (!personDoc || !personDoc.genre || personDoc.genre !== 'M') {
        Object.assign(filter, femaleOnlyFilter);
      }
    } else {
      Object.assign(filter, femaleOnlyFilter);
    }

    return this.getServices(filter);
  }

  async paginator(query: any) {
    const { pageIn = 0, pageOut = 20, name, franchiseId } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size) || from < 0 || size < 0) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = { ...activeFilter };

    if (franchiseId && isObjectId(franchiseId)) {
      filter.franchise = new mongoose.Types.ObjectId(franchiseId);
    }

    if (name && typeof name === 'string' && name.trim().length > 0) {
      filter.name = { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' };
    }

    const list = await ServiceModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'franchise',
          localField: 'franchise',
          foreignField: '_id',
          as: 'franchise',
        },
      },
      { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
      { $skip: from * size },
      { $limit: size },
    ]);
    const total = await ServiceModel.find(filter).countDocuments();

    return { list, total };
  }

  async search(query: any) {
    const { search } = query;
    if (!search || typeof search !== 'string' || search.trim().length === 0) {
      return [];
    }
    const filter: any = { ...activeFilter };
    filter.name = { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' };
    return ServiceModel.find(filter, { name: 1, type: 1 })
      .populate({ path: 'franchise', select: { name: 1 } })
      .lean();
  }

  /** Gráfico agrupado por dia/status, replicando o legacy. */
  async graphic() {
    const timezone = 'America/Sao_Paulo';

    const list: any[] = await ServiceModel.aggregate([
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

    const total: any[] = await ServiceModel.aggregate([
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
    body.images = [];
    body.makers = [];

    if (body._id || body._id === '') {
      delete body._id;
    }

    if (body.timeZone && body.timeZone.timeZone) {
      body.utc = body.timeZone.utc;
      body.timeZone = body.timeZone.timeZone;
    } else if (body.timeZone) {
      delete body.timeZone;
    }

    if (Array.isArray(body.file)) {
      body.file.forEach((item: any) => body.images.push(item.url));
    } else if (body.url) {
      body.images.push(body.url);
    }
    delete body.file;
    delete body.url;

    if (Array.isArray(body.maker)) {
      body.maker.forEach((item: any) => body.makers.push(item.url));
    } else if (body.maker && body.maker.url) {
      body.makers.push(body.maker.url);
    }
    delete body.maker;

    if (!body.name) {
      throw new AppError('Informe um Nome válido', 400);
    }

    return ServiceModel.create(body);
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const body: any = { ...data };

    if (`${body.status}` === 'true' || `${body.status}` === 'false') {
      body.status = `${body.status}` === 'true';
    }

    if (Array.isArray(body.file)) {
      body.images = [];
      body.file.forEach((item: any) => body.images.push(item.url));
    } else if (body.url) {
      body.images = [];
      body.images.push(body.url);
    }
    if (!body.file || typeof body.file !== 'object') {
      delete body.file;
      delete body.images;
    }
    delete body.url;

    if (Array.isArray(body.maker)) {
      body.makers = [];
      body.maker.forEach((item: any) => body.makers.push(item.url));
    } else if (body.maker && body.maker.url) {
      body.makers = [];
      body.makers.push(body.maker.url);
    }
    if (!body.maker || typeof body.maker !== 'object') {
      delete body.maker;
      delete body.makers;
    }

    if (body.timeZone && body.timeZone.timeZone) {
      body.utc = body.timeZone.utc;
      body.timeZone = body.timeZone.timeZone;
    } else if (body.timeZone) {
      delete body.timeZone;
    }

    if (!body.name) {
      throw new AppError('Informe um Nome válido', 400);
    }

    const updated = await ServiceModel.findOneAndUpdate({ _id: id }, body, {
      upsert: true,
      new: true,
    });
    if (!updated) {
      throw new AppError('Serviço não encontrado', 404);
    }
    return updated;
  }

  async remove(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const removed = await ServiceModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!removed) {
      throw new AppError('Registro não encontrado', 404);
    }
    return removed;
  }

  /** Detalhes do serviço (populado com franquia e picos de horário). */
  async serviceDetails(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }
    const item: any = await ServiceModel.findOne({ _id: id, ...activeFilter })
      .populate('franchise')
      .lean();
    if (!item) {
      throw new AppError('Serviço não encontrado', 404);
    }

    let peakHoursInfo: any[] = [];
    const peakIds = (item.peakHours || [])
      .map((h: any) => h._id)
      .filter((v: any) => v && isObjectId(String(v)))
      .map((v: any) => new mongoose.Types.ObjectId(String(v)));

    if (peakIds.length > 0) {
      const raw: any[] = await ServiceModel.aggregate([
        {
          $lookup: {
            from: 'peakHour',
            let: { ids: peakIds },
            as: 'peakHoursInfo',
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$ids'] },
                  status: true,
                  deletedAt: { $exists: false },
                },
              },
              { $sort: { start: 1 } },
            ],
          },
        },
        { $match: { _id: item._id } },
        { $unwind: { path: '$peakHoursInfo', preserveNullAndEmptyArrays: true } },
        { $replaceRoot: { newRoot: '$peakHoursInfo' } },
      ]);
      peakHoursInfo = raw;
    }

    return { ...item, peakHoursInfo };
  }

  private async getServices(filter: any) {
    return ServiceModel.aggregate([
      { $match: filter },
      {
        $project: {
          name: 1,
          franchise: 1,
          capacity: 1,
          priceCalculation: 1,
          minimumRate: 1,
          hourlyPrice: 1,
          basePrice: 1,
          valueByPercentage: 1,
          fixedValue: 1,
          baseDistance: 1,
          radiusSendRace: 1,
          timePrice: 1,
          currencyPrice: 1,
          dispensingMinutes: 1,
          ratePerMinute: 1,
          status: 1,
          onlyForWomen: 1,
          requireConfirmationCode: 1,
          images: 1,
          makers: 1,
          timeZone: 1,
          utc: 1,
          deletedAt: 1,
          distance: 1,
          peakHoursInfo: {
            $map: {
              input: '$peakHours',
              as: 'hours',
              in: { $toObjectId: '$$hours._id' },
            },
          },
          peakHours: 1,
          showArrivalTime: 1,
          info: 1,
          useDynamicsRace: 1,
        },
      },
      {
        $lookup: {
          from: 'peakHour',
          let: { peakHours: '$peakHoursInfo' },
          as: 'peakHoursInfo',
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$_id',
                    {
                      $cond: {
                        if: { $isArray: '$$peakHours' },
                        then: '$$peakHours',
                        else: [],
                      },
                    },
                  ],
                },
                status: true,
                deletedAt: { $exists: false },
              },
            },
            { $sort: { start: 1 } },
            { $project: { start: 1, end: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: 'franchise',
          let: { franchise: '$franchise' },
          as: 'franchise',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$franchise'] } } },
            { $project: { onlyMultiplesOf50: 1, settingsDriver: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true } },
    ]);
  }
}

/** Busca genérica em um modelo por _id retornando campos selecionados (evita import circular pesado). */
async function anyModelFindOneById(modelName: string, id: string, select: string[]): Promise<any> {
  try {
    const model = mongoose.models[modelName];
    if (!model) return null;
    const selectObj: any = {};
    select.forEach((s) => (selectObj[s] = 1));
    return model.findById(id).select(selectObj).lean();
  } catch {
    return null;
  }
}

export default new MobilityServiceService();
