/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {Request, Response} from 'express';
import moment from 'moment';

import {apiBraspagSplit} from '../../../services/Cielo/api';
import generateToken from '../../../services/Cielo/token';

import Transactions from '../../../models/ScheduleTransactions';

const ListTransactions = () => {
  async function list(req: Request, res: Response): Promise<Response> {
    try {
      let {
        initialDate,
        finalDate,
        eventStatus,
        page,
        merchantId,
      }: any = req.query;
      const pageSize = 100;

      if (!eventStatus) {
        eventStatus = 'Scheduled';
      }

      if (!page || page < 1) {
        page = 1;
      }

      if (!initialDate || !finalDate) {
        initialDate = moment()
          .utc(true)
          .subtract('3', 'hours')
          .format('YYYY-MM-DD');
        finalDate = initialDate;
      }

      let url = `/schedule-api/transactions?initialCaptureDate=${initialDate}`;
      url += `&finalCaptureDate=${finalDate}`;
      url += `&pageIndex=${page}&pageSize=${pageSize}`;
      url += `&eventStatus=${eventStatus}`;

      if (merchantId) {
        url += `&merchantIds${merchantId}`;
      }

      const token = await generateToken();
      const {data: response} = await apiBraspagSplit.get(url, {
        headers: {
          // MerchantId: process.env.BRASPAG_CLIENT_ID,
          // MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      for await (const transaction of response.Transactions) {
        const {
          PaymentId,
          CapturedDate,
          MerchantId,
          Nsu,
          AuthorizationCode,
          AuthorizationDate,
          Status,
          StatusDescription,
          CardNumber,
          OrderId,
          Schedules,
        } = transaction;
        const SchedulesPayload = JSON.stringify(Schedules);

        try {
          const verifyTransactions = await Transactions.count({
            where: {
              PaymentId,
            },
          });

          if (verifyTransactions <= 0) {
            await Transactions.create({
              PaymentId,
              CapturedDate,
              MerchantId,
              Nsu,
              AuthorizationCode,
              AuthorizationDate,
              Status,
              StatusDescription,
              CardNumber,
              OrderId,
              Schedules: SchedulesPayload,
            });
          }
        } catch (err) {
          console.log(err);
        }
      }

      return res.status(200).json(response);
    } catch (err) {
      let errPayload = null;
      if (err.response && err.response.data) {
        errPayload = err.response.data;
      } else {
        errPayload = err.message;
      }

      return res.status(400).json({
        message: 'Fail response list',
        data: errPayload,
      });
    }
  }

  return {
    list,
  };
};

export default ListTransactions;
