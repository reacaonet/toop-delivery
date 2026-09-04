import { Types } from 'mongoose';
import { ShoppingScheduleModel } from '../models/ShoppingSchedule';
import { AppError } from '../middleware/errorHandler';

const UTC_MINUS_3_MS = 3 * 60 * 60 * 1000;

const getCurrentWallClock = () => {
  const dt = new Date(Date.now() - UTC_MINUS_3_MS);
  const dayAtom = dt.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toUpperCase();
  const hour = dt.getUTCHours();
  const minute = dt.getUTCMinutes();
  const hourAtual = hour * 100 + minute;
  return { dayAtual: dayAtom, hourAtual };
};

interface ScheduleDaySlot {
  id: unknown;
  start: number;
  end: number;
}

export class ShoppingScheduleService {
  async listAll() {
    const rows = await ShoppingScheduleModel.aggregate([
      { $sort: { dayWeek: 1, startHour: 1 } },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyData',
        },
      },
      { $unwind: { path: '$companyData' } },
      {
        $group: {
          _id: '$company',
          company: { $first: { name: '$companyData.name' } },
          count: { $sum: 1 },
          schedules: { $push: '$$ROOT' },
        },
      },
    ]);

    return rows.map((row: any) => {
      const hours: Record<string, ScheduleDaySlot[]> = {};

      for (const day of row.schedules ?? []) {
        if (!hours[day.dayWeek]) {
          hours[day.dayWeek] = [];
        }
        hours[day.dayWeek].push({
          id: day._id,
          start: day.startHour,
          end: day.endHour,
        });
      }

      return {
        _id: row._id,
        company: row.company,
        count: row.count,
        hours,
      };
    });
  }

  async haveSchedule(company: string) {
    if (!company || !Types.ObjectId.isValid(company)) {
      throw new AppError('Id da empresa inválido', 400);
    }

    const isHave = await ShoppingScheduleModel.findOne({
      company,
      deletedAt: { $exists: false },
    }).lean();

    return { isSchedule: Boolean(isHave) };
  }

  async listByCompany(company: string, type?: unknown) {
    if (!company || !Types.ObjectId.isValid(company)) {
      throw new AppError('Id da empresa inválido', 400);
    }

    const filter: Record<string, any> = { company, deletedAt: { $exists: false } };

    if (type) {
      filter.type = { $in: ['BOTH', String(type)] };
    }

    const list = await ShoppingScheduleModel.find(filter).sort({ dayWeek: 1, startHour: 1 });

    const { dayAtual, hourAtual } = getCurrentWallClock();
    const daysToRetorn: Record<string, ScheduleDaySlot[]> = {};

    for (const day of list) {
      if (!daysToRetorn[day.dayWeek]) {
        daysToRetorn[day.dayWeek] = [];
      }

      if (day.dayWeek === dayAtual && day.startHour >= hourAtual) {
        if (!daysToRetorn['TODAY']) {
          daysToRetorn['TODAY'] = [];
        }
        daysToRetorn['TODAY'].push({
          id: day._id,
          start: day.startHour,
          end: day.endHour,
        });
      }

      daysToRetorn[day.dayWeek].push({
        id: day._id,
        start: day.startHour,
        end: day.endHour,
      });
    }

    return daysToRetorn;
  }

  async create(company: string, data: any) {
    if (!company || !Types.ObjectId.isValid(company)) {
      throw new AppError('Id da empresa inválido', 400);
    }

    await ShoppingScheduleModel.updateMany(
      {
        company,
        dayWeek: data.dayWeek,
        startHour: data.startHour,
        endHour: data.endHour,
        deletedAt: { $exists: false },
      },
      { $set: { deletedAt: new Date() } }
    );

    const schedule = await ShoppingScheduleModel.create({ company, ...data });
    return schedule.populate('company');
  }

  async update(id: string, data: any) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }

    const schedule = await ShoppingScheduleModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      data,
      { new: true, runValidators: true }
    );

    if (!schedule) throw new AppError('Agendamento não encontrado', 404);
    return schedule;
  }

  async updateMissingType() {
    const result = await ShoppingScheduleModel.updateMany(
      { type: { $exists: false } },
      { type: 'BOTH' }
    );
    return { modifiedCount: result.modifiedCount };
  }

  async softDelete(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Id do registro inválido', 400);
    }

    const removed = await ShoppingScheduleModel.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!removed) throw new AppError('Agendamento não encontrado', 404);
    return removed;
  }
}

export default new ShoppingScheduleService();