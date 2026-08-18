import {Request, Response} from 'express';
import cron from 'cron';
import SetRoutine from './routine';

export default {
  start(req: Request, res: Response): Response {
    try {
      const {shopperCompany, orderId} = req.body;

      if (!shopperCompany || !orderId) {
        return res.status(400).json({
          message: 'shopperCompany e orderId são obrigatórios',
        });
      }

      let count = 0;
      let loop = 1;
      const CronJob = cron.CronJob;
      const job = new CronJob(
        '*/16 * * * * *',
        () => {
          SetRoutine.function(shopperCompany, orderId, job, count, loop);
          count++;
          if (count === 5) {
            count = 0;
            loop++;
          }
        },
        null,
        true,
        'America/Sao_Paulo',
      );

      job.start();

      return res.status(200).json({
        message: 'Rotina para encontrar um entregador foi iniciada',
      });
    } catch (err: any) {
      return res.status(400).send({
        message: err.message,
      });
    }
  },
};
