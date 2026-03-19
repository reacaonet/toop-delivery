/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/class-name-casing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */

import {Request, Response} from 'express';

/** Model */
import LogsModel from '../../../models/logsModel';

/** Service */
import IuguCreditCardServices from '../../../services/Iugu/creditCard';

/** validators */

let appDebug: any = {};

const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;

    const {customer_id} = req.params;

    appDebug = {};
    appDebug.body = body;

    const iuguCreditCardServices = new IuguCreditCardServices();

    const card = await iuguCreditCardServices.saveInCustomer({
      ...body,
      customer_payment_id: customer_id,
    });

    // if (customer_id) {
    //   await iuguCreditCardServices.saveInCustomer({
    //     payment_id: card.id,
    //     customer_payment_id: customer_id,
    //     name: `Cartão de ${customer_id}`,
    //     token: card.id,
    //   });
    // }


    appDebug.card = card;

    if (!card || !card.id) {
      createLog(card, appDebug);

      return res.status(400).send({
        message: 'oops fail creating card in iugu',
        data: 'error creating card',
      });
    }


    return res.status(200).send(card);
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail iugu', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail create card in iugu',
      data: errPayload,
    });
  }
};

const createLog = async (err: any, errPayload: any) => {
  try {
    LogsModel.create({
      typeLog: 'ERROR',
      description: {
        messageErr: err.message,
        err: errPayload,
        appDebug: appDebug,
      },
      category: 'iugu',
      originError: 'fail-generate-card',
    });
  } catch (error) {
    console.log('fail create log', error);
  }
};

export default {store};
