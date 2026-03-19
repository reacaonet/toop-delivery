import {Request, Response} from 'express';

import {apiCielo} from '../../../services/Cielo/api';
import validatePost from '../../../validators/Payment';
import generateToken from '../../../services/Cielo/token';

const saveCard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = await generateToken();
    const {
      CustomerName,
      CardNumber,
      Holder,
      ExpirationDate,
      Brand,
      SecurityCode,
    } = req.body;

    const isMessage = validatePost({
      CustomerName,
      CardNumber,
      Holder,
      ExpirationDate,
      Brand,
      SecurityCode,
    });

    if (isMessage !== true) {
      return res.status(400).json({
        message: 'Failed to send data',
        data: isMessage,
      });
    }

    if (!token) {
      return res.status(400).json({
        message: 'Authentication failed',
        data: 'Failed to generate the authentication token',
      });
    }

    // const verifyCard = await apiCielo.post(
    //   '/1/zeroauth/',
    //   {
    //     CardNumber,
    //     Holder,
    //     ExpirationDate,
    //     Brand,
    //     SaveCard: true,
    //     CardOnFile: {
    //       Usage: 'First',
    //       Reason: 'Unscheduled',
    //     },
    //   },
    //   {
    //     headers: {
    //       MerchantId: process.env.MERCHANT_ID,
    //       MerchantKey: process.env.MERCHANT_KEY,
    //     },
    //   },
    // );

    // if (verifyCard.data.Valid !== true) {
    //   return res.status(400).json({
    //     message: 'Card validation failed',
    //     data: 'Authorization denied, use another card',
    //   });
    // }

    const response = await apiCielo.post(
      '/1/card/',
      {
        CustomerName,
        CardNumber,
        Holder,
        ExpirationDate,
        Brand,
      },
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          MerchantId: process.env.BRASPAG_CLIENT_ID,
          MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
        },
      },
    );

    return res.status(200).json({
      message: 'Successful save Card',
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
      message: 'Fail save Card',
      data: errPayload,
    });
  }
};

export default saveCard;
