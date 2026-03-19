import {Request, Response} from 'express';

import {apiCielo} from '../../services/Cielo/api';
import generateToken from '../../services/Cielo/token';

/** Util */
import payloadError from '../../util/payloadError';

const cancellationPartial = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {PaymentId} = req.params;
    const {payload, amount} = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'amount is invalid',
      });
    }

    if (!payload || !Array.isArray(payload) || payload.length <= 0 ) {
      return res.status(400).json({
        message: 'Fail Payload is invalid',
      });
    }

    for (const item of payload) {
      if (!item.SubordinateMerchantId || item.SubordinateMerchantId === null) {
        item.SubordinateMerchantId = process.env.BRASPAG_CLIENT_ID;
      }
    }

    const token = await generateToken();
    if (!token) {
      return res.status(400).json({
        message: 'Fail token auth',
        data: token,
      });
    }

    apiCielo.defaults.headers.common['Authorization'] =
    `Bearer ${token.access_token}`;

    const {data: response} =
      await apiCielo.put(
        `/1/sales/${PaymentId}/void?amount=${amount}`,
        {
          VoidSplitPayments: payload,
        },
      );

    return res.status(200).json({
      message: 'Successful cancellation Partial',
      data: response,
    });
  } catch (err) {
    return res.status(400).json({
      message: 'Fail cancellation partial',
      data: payloadError(err),
    });
  }
};

export default cancellationPartial;
