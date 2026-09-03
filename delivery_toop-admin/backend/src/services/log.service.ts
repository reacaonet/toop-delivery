import mongoose from 'mongoose';
import { LogModel, ILog } from '../models/Log';
import { AppError } from '../middleware/errorHandler';

class LogService {
  async create(payload: Partial<ILog>) {
    const log = await LogModel.create(payload);
    return log;
  }

  async list(id?: string) {
    if (id) {
      if (!mongoose.isValidObjectId(id)) {
        throw new AppError('Id inválido', 400);
      }
      const log = await LogModel.findById(id);
      if (!log) throw new AppError('Log não encontrado', 404);
      return log;
    }
    return LogModel.find().sort({ createdAt: -1 });
  }

  async paginator(query: any) {
    const pageIn = parseInt(query.pageIn, 10);
    const pageOut = parseInt(query.pageOut, 10);
    if (isNaN(pageIn) || isNaN(pageOut) || pageIn < 0 || pageOut < 1) {
      throw new AppError('Dados da paginação inválidos', 400);
    }
    const list = await LogModel.find()
      .limit(pageOut)
      .skip(pageIn * pageOut)
      .sort({ createdAt: -1 });
    const total = await LogModel.countDocuments();
    return { list, total };
  }

  async errorLog(payload: Partial<ILog>) {
    await LogModel.create({
      typeSystem: 'BACKEND',
      typeLog: 'ERROR',
      ...payload,
    });
  }
}

export default new LogService();
