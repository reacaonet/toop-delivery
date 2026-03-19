import {Request, Response} from 'express';

import {apiQueryCielo} from '../../../services/Cielo/api';
import generateToken from '../../../services/Cielo/token';

const listCard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {tokenCard} = req.params;
    const token = await generateToken();

    const response = await apiQueryCielo.get(`/1/card/${tokenCard}`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        // MerchantId: process.env.BRASPAG_CLIENT_ID,
        // MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
      },
    });

    return res.status(200).json({
      message: 'Successful list Card',
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
      message: 'Fail list Card',
      data: errPayload,
    });
  }
};

export default listCard;
