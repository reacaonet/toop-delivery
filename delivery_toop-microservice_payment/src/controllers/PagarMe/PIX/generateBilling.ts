/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {Request, Response} from 'express';
import moment from 'moment';

/** Model */
import LogsModel from '../../../models/logsModel';

/** Service */
import {apiPagarMe} from '../../../services/PagarMe/api';

let appDebug: any = {};

const generateBilling = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {amount, items = []} = req.body;
    appDebug = {};
    appDebug.body = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).send({
        message: 'Informe o valor do pix',
      });
    }

    const {data: respPagarMe} = await apiPagarMe.post(`/transactions`, {
      payment_method: 'pix',
      amount: Number(amount),
      pix_expiration_date: moment().utc(false).add(5, 'minutes').format(),
      pix_additional_fields: items,
    });

    return res.status(200).send(respPagarMe);
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail pagarme', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail create Sales',
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
      category: 'pagarme',
      originError: 'fail-generate-pix',
    });
  } catch (error) {
    console.log('fail create log', error);
  }
};

export default generateBilling;
