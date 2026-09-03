import mongoose from 'mongoose';
import { BookingModel } from '../models/Booking';
import { DriverModel } from '../models/Driver';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class MobilityReportService {
  /* ------------------------------------------------------------------ */
  /*  Adm Driver Report — paginated list of bookings grouped by driver   */
  /* ------------------------------------------------------------------ */
  async admDriverReport(query: any) {
    const { pageIn = 0, pageOut = 10, startDate, endDate, status, driver, company } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);

    const filter: any = {};
    if (driver && isObjectId(driver)) {
      filter.driver = new mongoose.Types.ObjectId(driver);
    }
    if (company && isObjectId(company)) {
      filter.company = new mongoose.Types.ObjectId(company);
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    const pipeline: any[] = [
      { $match: filter },
      { $project: { rejectedDrivers: 0, __v: 0 } },
      {
        $lookup: {
          from: 'driver',
          let: { id: '$driver' },
          as: 'driver',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, phone: 1, email: 1, rating: 1 } },
          ],
        },
      },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          date: {
            $dateToString: { format: '%d/%m/%Y %H:%M', date: '$createdAt', timezone: 'America/Sao_Paulo' },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: from * size },
      { $limit: size },
    ];

    const list = await BookingModel.aggregate(pipeline);
    const total = await BookingModel.countDocuments(filter);
    return { list, total };
  }

  /* ------------------------------------------------------------------ */
  /*  Adm Driver Balance — aggregation summary                           */
  /* ------------------------------------------------------------------ */
  async admDriverBalance(query: any) {
    const { startDate, endDate, status, driver, company } = query;

    const filter: any = {};
    if (driver && isObjectId(driver)) {
      filter.driver = new mongoose.Types.ObjectId(driver);
    }
    if (company && isObjectId(company)) {
      filter.company = new mongoose.Types.ObjectId(company);
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    const pipeline: any[] = [
      { $match: filter },
      {
        $group: {
          _id: 1,
          approved_count: {
            $sum: { $cond: { if: { $eq: ['$status', 'completed'] }, then: 1, else: 0 } },
          },
          cancelled_count: {
            $sum: { $cond: { if: { $eq: ['$status', 'cancelled'] }, then: 1, else: 0 } },
          },
          totalRevenue: {
            $sum: {
              $cond: { if: { $eq: ['$status', 'completed'] }, then: { $ifNull: ['$finalPrice', '$estimatedPrice', 0] }, else: 0 },
            },
          },
          totalDriverEarnings: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'completed'] },
                then: { $multiply: [{ $ifNull: ['$finalPrice', '$estimatedPrice', 0] }, 0.8] },
                else: 0,
              },
            },
          },
        },
      },
    ];

    const result = await BookingModel.aggregate(pipeline);
    return result && result.length > 0 ? result[0] : {};
  }

  /* ------------------------------------------------------------------ */
  /*  Adm Passenger Report — paginated list of bookings by passenger     */
  /* ------------------------------------------------------------------ */
  async admPassengerReport(query: any) {
    const { pageIn = 0, pageOut = 10, startDate, endDate, status, client } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);

    const filter: any = {};
    if (client && isObjectId(client)) {
      filter.client = new mongoose.Types.ObjectId(client);
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'user',
          let: { id: '$client' },
          as: 'client',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, phone: 1, email: 1 } },
          ],
        },
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          date: {
            $dateToString: { format: '%d/%m/%Y %H:%M', date: '$createdAt', timezone: 'America/Sao_Paulo' },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: from * size },
      { $limit: size },
    ];

    const list = await BookingModel.aggregate(pipeline);
    const total = await BookingModel.countDocuments(filter);
    return { list, total };
  }

  /* ------------------------------------------------------------------ */
  /*  Adm Passenger Balance                                              */
  /* ------------------------------------------------------------------ */
  async admPassengerBalance(query: any) {
    const { startDate, endDate, status, client } = query;

    const filter: any = {};
    if (client && isObjectId(client)) {
      filter.client = new mongoose.Types.ObjectId(client);
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    const pipeline: any[] = [
      { $match: filter },
      {
        $group: {
          _id: 1,
          approved: {
            $sum: { $cond: { if: { $eq: ['$status', 'completed'] }, then: 1, else: 0 } },
          },
          cancelled: {
            $sum: { $cond: { if: { $eq: ['$status', 'cancelled'] }, then: 1, else: 0 } },
          },
          total: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'completed'] },
                then: { $ifNull: ['$finalPrice', '$estimatedPrice', 0] },
                else: 0,
              },
            },
          },
        },
      },
    ];

    const result = await BookingModel.aggregate(pipeline);
    return result && result.length > 0 ? result[0] : {};
  }

  /* ------------------------------------------------------------------ */
  /*  Adm Races Report — paginated list of all bookings                  */
  /* ------------------------------------------------------------------ */
  async admRacesReport(query: any) {
    const { pageIn = 0, pageOut = 10, startDate, endDate, status, client, company } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);

    const filter: any = {};
    if (client && isObjectId(client)) {
      filter.client = new mongoose.Types.ObjectId(client);
    }
    if (company && isObjectId(company)) {
      filter.company = new mongoose.Types.ObjectId(company);
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'user',
          let: { id: '$client' },
          as: 'client',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, phone: 1, email: 1 } },
          ],
        },
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'driver',
          let: { id: '$driver' },
          as: 'driver',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, email: 1, phone: 1 } },
          ],
        },
      },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          date: {
            $dateToString: { format: '%d/%m/%Y %H:%M', date: '$createdAt', timezone: 'America/Sao_Paulo' },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: from * size },
      { $limit: size },
    ];

    const list = await BookingModel.aggregate(pipeline);
    const total = await BookingModel.countDocuments(filter);
    return { list, total };
  }

  /* ------------------------------------------------------------------ */
  /*  Adm Races Balance                                                  */
  /* ------------------------------------------------------------------ */
  async admRacesBalance(query: any) {
    const { startDate, endDate, status, client, company } = query;

    const filter: any = {};
    if (client && isObjectId(client)) {
      filter.client = new mongoose.Types.ObjectId(client);
    }
    if (company && isObjectId(company)) {
      filter.company = new mongoose.Types.ObjectId(company);
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    const pipeline: any[] = [
      { $match: filter },
      {
        $group: {
          _id: 1,
          approved: {
            $sum: { $cond: { if: { $eq: ['$status', 'completed'] }, then: 1, else: 0 } },
          },
          cancelled: {
            $sum: { $cond: { if: { $eq: ['$status', 'cancelled'] }, then: 1, else: 0 } },
          },
          total: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'completed'] },
                then: { $ifNull: ['$finalPrice', '$estimatedPrice', 0] },
                else: 0,
              },
            },
          },
        },
      },
    ];

    const result = await BookingModel.aggregate(pipeline);
    return result && result.length > 0 ? result[0] : {};
  }

  /* ------------------------------------------------------------------ */
  /*  Driver Paginator — paginated list of drivers                        */
  /* ------------------------------------------------------------------ */
  async driverPaginator(query: any) {
    const { pageIn = 0, pageOut = 10, driverId, email, startDate, endDate, status } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);

    const filter: any = {};
    if (driverId && isObjectId(driverId)) {
      filter._id = new mongoose.Types.ObjectId(driverId);
    }
    if (email) {
      const decodeEmail = decodeURIComponent(email);
      filter.email = { $regex: '.*' + decodeEmail.toLowerCase() + '.*', $options: 'i' };
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
    if (status !== undefined && status !== '' && status !== 'all') {
      filter.active = `${status}` === 'true';
    }

    const list = await DriverModel.find(filter)
      .sort({ name: 1 })
      .skip(from * size)
      .limit(size);
    const total = await DriverModel.countDocuments(filter);
    return { list, total };
  }

  /* ------------------------------------------------------------------ */
  /*  Map Monitoring — active bookings for map view                      */
  /* ------------------------------------------------------------------ */
  async mapMonitoring(query: any) {
    const { pageIn = 1, pageOut = 10, company } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);

    const filter: any = {
      status: { $in: ['matching', 'accepted', 'in_progress', 'pending'] },
    };
    if (company && isObjectId(company)) {
      filter.company = new mongoose.Types.ObjectId(company);
    }

    const pipeline: any[] = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          client: 1,
          driver: 1,
          pickup: 1,
          dropoff: 1,
          serviceCategory: 1,
          vehicleType: 1,
          estimatedPrice: 1,
          proposedPrice: 1,
          distance: 1,
          duration: 1,
          createdAt: 1,
          status: 1,
          paymentMethod: 1,
          scheduledAt: 1,
          statusTxt: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'matching'] }, then: 'Buscando' },
                { case: { $eq: ['$status', 'accepted'] }, then: 'Aceito' },
                { case: { $eq: ['$status', 'in_progress'] }, then: 'Em Andamento' },
                { case: { $eq: ['$status', 'pending'] }, then: 'Agendado' },
              ],
              default: '',
            },
          },
        },
      },
      { $skip: (from - 1) * size },
      { $limit: size },
      {
        $lookup: {
          from: 'user',
          let: { id: '$client' },
          as: 'client',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, email: 1, phone: 1, avatar: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: 'driver',
          let: { id: '$driver' },
          as: 'driver',
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
            { $limit: 1 },
            { $project: { name: 1, phone: 1, email: 1, currentLocation: 1, active: 1, updatedAt: 1 } },
          ],
        },
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    ];

    const list = await BookingModel.aggregate(pipeline);
    return list;
  }

  /* ------------------------------------------------------------------ */
  /*  Active Monitoring — placeholder (needs redis, stub for now)        */
  /* ------------------------------------------------------------------ */
  async activeMonitoring(query: any, userId?: string) {
    const key = userId ? `monitoring:user:${userId}` : 'monitoring:root';
    const value = userId || 'root';
    return { key, value };
  }
}

export default new MobilityReportService();
