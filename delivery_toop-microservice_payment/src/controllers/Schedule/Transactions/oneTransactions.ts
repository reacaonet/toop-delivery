/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {Request, Response} from 'express';
import {apiBraspagSplit} from '../../../services/Cielo/api';
import generateToken from '../../../services/Cielo/token';

function OneTransaction() {
  async function one(req: Request, res: Response): Promise<Response> {
    try {
      const {paymentId, merchantId} = req.params;

      if (!paymentId) {
        return res.status(400).json({
          message: 'inform PaymentId',
        });
      }

      if (!merchantId) {
        return res.status(400).send({
          message: 'inform merchantID',
        });
      }

      let url = `/schedule-api/transactions/${paymentId}`;
      url += `?merchantIds=${merchantId}`;

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
        message: 'Fail get result',
        data: errPayload,
      });
    }
  }

  return {
    one,
  };
}

export default OneTransaction;
