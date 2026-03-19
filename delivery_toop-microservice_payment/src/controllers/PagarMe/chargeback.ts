/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/camelcase */
import {Request, Response} from 'express';

/** Model */
import LogsModel from '../../models/logsModel';

/** Service */
import {apiPagarMe} from '../../services/PagarMe/api';

let appDebug: any = {};

const chargeback = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {transactionId} = req.params;
    appDebug = {};
    appDebug.transactionId = transactionId;

    if (!transactionId) {
      return res.status(400).send({
        message: 'Informe o transactionId',
      });
    }

    const {data: respPagarMe} = await apiPagarMe.post(
      `/transactions/${transactionId}/refund`,
    );

    sucessLog(respPagarMe, 'success');

    return res.status(200).json({
      message: 'Successful chargeback Sales',
      data: respPagarMe,
      statusMessage: 'success',
    });
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail chargeback pagarme', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail chargeback Sales',
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
      originError: 'fail-chargeback-pagarme',
    });
  } catch (error) {
    console.log('fail create log', error);
  }
};

const sucessLog = (payload: any, message: any) => {
  try {
    LogsModel.create({
      typeLog: 'SUCCESS',
      description: {
        payload: payload,
        message: message,
      },
      category: 'pagarme',
      originError: 'chargeback-pagarme',
    });
  } catch (error) {
    console.log('fail create sucessLog', error);
  }
};

const registerLog = (payload: any, type = 'WARN') => {
  try {
    LogsModel.create({
      typeLog: type,
      description: {
        payload: payload,
      },
      category: 'pagarme',
      originError: 'validate-pagarme',
    });
  } catch (error) {
    console.log('fail create sucessLog', error);
  }
};

export default chargeback;
