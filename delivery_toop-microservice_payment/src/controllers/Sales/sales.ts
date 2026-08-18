import {Request, Response} from 'express';

import {apiCielo} from '../../services/Cielo/api';
import * as validateSales from '../../validators/Sales';
import generateToken from '../../services/Cielo/token';

const sales = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = await generateToken();
    const data = req.body;

    const isMerchantOrderId = validateSales.merchantOrderId(
      data.MerchantOrderId,
    );
    const isCustomer = validateSales.validateCustomer(
      data.Customer && data.Customer.Name ? data.Customer.Name : '',
    );
    if (!data.Payment) {
      return res.status(400).json({
        message: 'Fail save Card',
        data: 'Payment is required',
      });
    }

    const isPayment = validateSales.validatePayment(data.Payment);

    if (
      isMerchantOrderId !== true ||
      isCustomer !== true ||
      isPayment !== true
    ) {
      return res.status(400).json({
        message: 'Fail save Card',
        data: 'Fail validation',
      });
    }

    if (!token) {
      return res.status(400).json({
        message: 'Fail create Sales',
        data: token,
      });
    }

    const response = await apiCielo.post('/1/sales', data, {
      headers: {
        // MerchantId: process.env.BRASPAG_CLIENT_ID,
        // MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    return res.status(200).json({
      message: 'Successful create Sales',
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
      message: 'Fail create Sales',
      data: errPayload,
    });
  }
};

export default sales;
