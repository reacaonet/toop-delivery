import {Request, Response} from 'express';
import cron from 'cron';
import SetRoutine from './routine';
// import jwt from 'jsonwebtoken';

export default {
  start(req: Request, res: Response): Response {
    try {
      // const token = req.headers.authorization?.replace('Bearer ', '');

      // if (!token) {
      //   return res.status(400).json({
      //     message: 'Você não tem autorização para acessar essa rota',
      //   });
      // }

      // const privateKey = fs.readFileSync(
      //   'src/config/privateKey/index.key',
      //   'utf8',
      // );
      // jwt.verify(token, privateKey);

      const {shopperCompany, orderId} = req.body;

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
        message: 'Rotina para encontrar um entregador foi iniciado',
      });
    } catch (err) {
      return res.status(400).send({
        message: err.message,
      });
    }
  },
};
