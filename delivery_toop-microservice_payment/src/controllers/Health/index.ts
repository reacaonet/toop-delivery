import {Request, Response} from 'express';
import {getSequelize} from '../../database/Postgres';

export default {
  async index(_req: Request, res: Response): Promise<Response> {
    let dbStatus = 'disconnected';
    try {
      const sequelize = getSequelize();
      if (sequelize) {
        await sequelize.authenticate();
        dbStatus = 'connected';
      }
    } catch {
      dbStatus = 'error';
    }
    return res.status(200).json({
      status: 'online',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  },
};
