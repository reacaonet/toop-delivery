import mongoose from 'mongoose';
import { VehicleDocumentsModel } from '../models/VehicleDocuments';
import { DriverModel } from '../models/Driver';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class VehicleDocumentsService {
  async paginator(query: any) {
    const { pageIn = 0, pageOut = 20, searchDriver } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = {};
    const filterDriver: any = {};

    if (searchDriver) {
      filterDriver['$or'] = [
        {
          'driver.name': {
            $regex: `.*${searchDriver.toLowerCase()}.*`,
            $options: 'i',
          },
        },
        {
          'driver.phone': {
            $regex: `.*${searchDriver.toLowerCase()}.*`,
            $options: 'i',
          },
        },
      ];
    }

    const list = await VehicleDocumentsModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'driver',
          let: { driver: '$driver' },
          as: 'driver',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$driver'],
                },
              },
            },
            {
              $project: {
                name: 1,
                phone: 1,
                franchise: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      { $match: filterDriver },
      { $sort: { approved: 1, status: 1, createdAt: -1 } },
      { $skip: from * size },
      { $limit: size },
    ]);

    const total = await VehicleDocumentsModel.find(filter).countDocuments();

    return { list, total };
  }

  async listByDriver(driverId: string, query: any) {
    if (!isObjectId(driverId)) {
      throw new AppError('Id do motorista inválido', 400);
    }

    const { approved, status } = query;
    const filter: any = {};

    filter.driver = new mongoose.Types.ObjectId(driverId);

    if (`${approved}` === 'true' || `${approved}` === 'false') {
      filter.approved = `${approved}` === 'true';
    }

    if (`${status}` === 'true' || `${status}` === 'false') {
      filter.status = `${status}` === 'true';
    }

    return VehicleDocumentsModel.find(filter);
  }

  async create(data: any) {
    if (!data.driver || !isObjectId(data.driver)) {
      throw new AppError('Id do motorista é inválido', 400);
    }
    if (!data.vehicleManufacturer || !data.vehicleModel || !data.vehicleNameplate || !data.vehicleYear || !data.vehicleColor) {
      throw new AppError('Preencha todos os campos obrigatórios do veículo', 400);
    }
    return VehicleDocumentsModel.create(data);
  }

  async update(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('Id inválido', 400);
    }

    if (`${data.status}` === 'true' || `${data.status}` === 'false') {
      data.status = `${data.status}` === 'true';
    }

    if (`${data.approved}` === 'true' || `${data.approved}` === 'false') {
      data.approved = `${data.approved}` === 'true';
    }

    await VehicleDocumentsModel.updateOne({ _id: id }, data);

    const response = await VehicleDocumentsModel.findById(id).lean();
    if (!response) {
      throw new AppError('Registro não encontrado', 404);
    }

    if (`${data.status}` === 'true') {
      const driverId = (response.driver as any).toString();
      await DriverModel.updateOne(
        { _id: driverId },
        {
          vehicleManufacturer: response.vehicleManufacturer,
          vehicleModel: response.vehicleModel,
          vehicleNameplate: response.vehicleNameplate,
          vehicleYear: response.vehicleYear,
          vehicleColor: response.vehicleColor,
        },
      );

      await VehicleDocumentsModel.updateMany(
        { _id: { $ne: id }, driver: response.driver },
        { status: false },
      );
    }

    return response;
  }
}

export default new VehicleDocumentsService();
