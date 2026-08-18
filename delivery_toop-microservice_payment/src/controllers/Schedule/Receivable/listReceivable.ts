import {Request, Response} from 'express';
import moment from 'moment';
import {apiBraspagSplit} from '../../../services/Cielo/api';
import generateToken from '../../../services/Cielo/token';

function ListReceivable(): {list: any} {
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

      if (!initialDate || !finalDate) {
        initialDate = moment()
          .utc(true)
          .subtract('3', 'hours')
          .format('YYYY-MM-DD');
        finalDate = initialDate;
      }

      if (!page || page <= 0) {
        page = 1;
      }

      let url = `/schedule-api/events?initialForecastedDate=${initialDate}`;
      url += `&finalForecastedDate=${finalDate}`;
      url += `&pageIndex=${page}&pageSize=${pageSize}`;
      url += `&eventStatus=${eventStatus}`;

      if (merchantId) {
        url += `&merchantIds=${merchantId}`;
      }

      const token = await generateToken();

      const {data: response} = await apiBraspagSplit.get(url, {
        headers: {
          // MerchantId: process.env.BRASPAG_CLIENT_ID,
          // MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      return res.status(200).json(response);
    } catch (err) {
      let errPayload = null;
      if (err.response && err.response.data) {
        errPayload = err.response.data;
      } else {
        errPayload = err.message;
      }

      return res.status(400).json({
        message: 'Fail response ListReceivable',
        data: errPayload,
      });
    }
  }

  return {
    list,
  };
}

export default ListReceivable;
