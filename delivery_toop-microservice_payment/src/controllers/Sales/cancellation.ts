import {Request, Response} from 'express';

import {apiCielo} from '../../services/Cielo/api';
import generateToken from '../../services/Cielo/token';

const cancellationTotal = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const token = await generateToken();
    const {PaymentId} = req.params;

    if (!token) {
      return res.status(400).json({
        message: 'Fail token auth',
        data: token,
      });
    }

    apiCielo.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${token.access_token}`;

    const response = await apiCielo.put(`/1/sales/${PaymentId}/void`);

    return res.status(200).json({
      message: 'Successful cancellation total',
      data: response.data,
    });
  } catch (err) {
    let errPayload = null;
    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    return res.status(400).json({
      message: 'Fail cancellation total',
      data: errPayload,
    });
  }
};

export default cancellationTotal;
