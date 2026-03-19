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
import IuguCustomersServices from '../../../services/Iugu/customers';

/** validators */
import validatorCustomer from './../../../validators/Iugu/customer';

let appDebug: any = {};

const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;

    appDebug = {};
    appDebug.body = body;

    const isValidPayload = validatorCustomer(body);

    if (isValidPayload !== true) {
      return res.status(400).send({
        message: isValidPayload,
        data: 'Fail validation',
      });
    }

    if (!body.number) body.number = 'S/N';

    const iuguCustomersServices = new IuguCustomersServices();

    const customer = await iuguCustomersServices.store(body);

    if (!customer || !customer.id) {
      return res.status(400).send({
        message: 'oops fail creating customer in iugu',
        data: 'error creating customer',
      });
    }

    appDebug.customer = customer;

    return res.status(200).send(customer);
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
      message: 'Fail create Customer in iugu',
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
      originError: 'fail-generate-customer',
    });
  } catch (error) {
    console.log('fail create log', error);
  }
};

export default {store};
