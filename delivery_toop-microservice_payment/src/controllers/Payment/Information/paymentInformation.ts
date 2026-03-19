import {Request, Response} from 'express';
import {apiQueryCielo} from '../../../services/Cielo/api';
import generateToken from '../../../services/Cielo/token';

const information = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {paymentId} = req.params;

    if (!paymentId) {
      return res.status(400).json({
        message: 'Enter a payment for consultation',
      });
    }

    const token = await generateToken();
    const {data: response} = await apiQueryCielo.get(`/1/sales/${paymentId}`, {
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
      message: 'Fail list Information',
      data: errPayload,
    });
  }
};

export default information;
