import mongoose from 'mongoose';
import { BookingModel } from '../models/Booking';
import { AppError } from '../middleware/errorHandler';

const MONTHS: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

export class MobilityExtractService {
  async driverBalance(driverId: string, timezone = 'America/Sao_Paulo') {
    if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) {
      throw new AppError('Id do motorista inválido', 400);
    }

    const filter: any = {
      driver: new mongoose.Types.ObjectId(driverId),
      status: 'completed',
    };

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setDate(1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: oneMonthAgo };

    const list = await BookingModel.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          price: '$finalPrice',
          createdAt: 1,
          year: { $dateToString: { date: '$createdAt', format: '%Y', timezone } },
          month: { $dateToString: { date: '$createdAt', format: '%m', timezone } },
          day: { $dateToString: { date: '$createdAt', format: '%d', timezone } },
        },
      },
    ]);

    const groupList: Record<string, any[]> = {};

    for (const item of list as any[]) {
      const key = `${item.year}-${item.month}`;
      if (!groupList[key]) groupList[key] = [];
      groupList[key].push({ ...item, monthTxt: MONTHS[item.month] || '' });
    }

    return groupList;
  }
}

export default new MobilityExtractService();
