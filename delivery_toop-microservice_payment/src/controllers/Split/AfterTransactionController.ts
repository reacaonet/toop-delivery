import {Request, Response} from 'express';
import {apiBraspagSplit} from '../../services/Cielo/api';
import generateToken from '../../services/Cielo/token';

import Log from '../../models/logsModel';

const getMessageError = (
  res: Response,
  message: string,
  payloadError: string,
): Response => {
  Log.create({
    typeLog: 'ERROR',
    category: 'Payment Error',
    originError: 'src/controllers/Split/AfterTransactionController',
    description: message,
    payload: payloadError,
  });
  return res.status(400).send({
    message: message,
  });
};

/**
 * @param {req} req request
 * @param {res} res response
 * @param {PaymentId} PaymentId Id Pasyment Braspag
 * @param {res.body.payload} payload braspag Payload
 * @param {res.body.mdr} mdr in percent
 * @param {res.body.fee} fee in cents
 * @url /v1/split/after/:PaymentId
 * @return {Promise<Response>}
 */
const afterTransactionController =
async (req: Request, res: Response): Promise<Response> => {
  const {
    total,
    payload,
  } = req.body;
  const {PaymentId} = req.params;

  try {
    const split = [];

    if (!PaymentId) {
      const payloadError = {
        total,
        payload,
        PaymentId,
      };
      return getMessageError(
        res,
        'Informe um PaymentId Válido',
        JSON.stringify(payloadError),
      );
    }

    if (!payload || typeof payload !== 'object' || payload.length <= 0) {
      const payloadError = {
        total,
        payload,
        PaymentId,
      };
      return getMessageError(
        res,
        'Envie as informações necessárias para procesamento',
        JSON.stringify(payloadError),
      );
    }

    for (const item of payload) {
      if (!item.subordinateId) {
        const payloadError = {
          total,
          payload: item,
          PaymentId,
        };
        return getMessageError(
          res,
          'Informe um SubordinateMerchantId',
          JSON.stringify(payloadError),
        );
      }

      if (!item.amount || item.amount <= 0) {
        const payloadError = {
          total,
          payload: item,
          PaymentId,
        };
        return getMessageError(
          res,
          'Informe um valor válido',
          JSON.stringify(payloadError),
        );
      }

      let amountCents = 0;
      let percent = 0;
      let cents = 0;

      amountCents = Number(`${item.amount}`);
      amountCents = Number(amountCents.toFixed(2)) * 100;

      if (item.mdr && item.mdr > 0) {
        percent = item.mdr;
      }

      if (item.fee && item.fee > 0) {
        cents = (item.fee.toFixed(2)) * 100;
      }

      split.push({
        SubordinateMerchantId: item.subordinateId,
        Amount: amountCents,
        Fares: {
          Mdr: percent,
          Fee: cents,
        },
      });
    }

    const splitTemp = [...split];
    let totalEcbr = Number(`${total}`);
    totalEcbr = Number(totalEcbr.toFixed(2)) * 100; // in cents

    for (const item of splitTemp) {
      totalEcbr -= item.Amount;
    }

    if (totalEcbr < 0) {
      const payloadError = {
        total,
        payload,
        PaymentId,
      };
      return getMessageError(
        res,
        `Valores informado para divisão no final não pode
        ser zero para o EconomizeBr`,
        JSON.stringify(payloadError),
      );
    }

    // ECBR Split
    if (totalEcbr > 0) {
      split.push({
        SubordinateMerchantId: process.env.BRASPAG_CLIENT_ID,
        Amount: totalEcbr,
        Fares: {
          Mdr: 0,
          Fee: 0,
        },
      });
    }

    const token = await generateToken();
    if (!token || !token.access_token) {
      const payloadError = {
        total,
        payload,
        PaymentId,
      };
      return getMessageError(
        res,
        'Não foi possível gerar token de autenticação',
        JSON.stringify(payloadError),
      );
    }

    const {data: response} =
      await apiBraspagSplit.put(`/api/transactions/${PaymentId}/split`, split, {
        headers: {
          // MerchantId: process.env.BRASPAG_CLIENT_ID,
          // MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
          Authorization: `Bearer ${token.access_token}`,
        },
      });

    if (!response || !response.PaymentId) {
      const payloadError = {
        total,
        payload,
        PaymentId,
      };
      return getMessageError(
        res,
        'Não foi possível realizar a divisão',
        JSON.stringify(payloadError),
      );
    }

    const payloadError = {
      total,
      payload,
      PaymentId,
    };
    Log.create({
      typeLog: 'SUCCESS',
      category: 'Payment Error (try/catch)',
      originError: 'src/controllers/Split/AfterTransactionController',
      payload: JSON.stringify(payloadError),
    });

    return res.status(200).send(response);
  } catch (err) {
    let messageError = err.message;
    const payloadError = {
      total,
      payload,
      PaymentId,
    };

    if (err && err.response && err.response.data) {
      messageError = err.response.data;
    }

    Log.create({
      typeLog: 'ERROR',
      category: 'Payment Error (try/catch)',
      originError: 'src/controllers/Split/AfterTransactionController',
      description: messageError,
      payload: JSON.stringify(payloadError),
    });
    return res.status(400).send({
      message: 'Não foi possível enviar solicitação',
      err: messageError,
    });
  }
};

export default afterTransactionController;
