import apiEconomizeBr from '../apiEconomizeBr';
import QueueSplit from '../../models/QueueSplit';
import restartService from './restartService';
import captureError from './error/captureError';
import queueConfig from '../../config/queueConfig.json';

/* Person */
import customer from './person/customer';
import {companyCustomerInput, companyToCompanyOutput} from './person/company';

const delay = 25000;
const maxAttempt = queueConfig.maxAttempt;
const serviceName = 'dispatchOrderProcess';

async function updateAttemps(queue: any): Promise<void> {
  try {
    await QueueSplit.updateOne({_id: queue._id}, {
      attempt: queue.attempt + 1,
    });
  } catch (err) {
    captureError(`${serviceName} - updateAttemps`, err);
  }
}

/* Init */
async function dispatchOrderProcess(): Promise<void> {
  try {
    const queue: any = await QueueSplit
      .findOne({
        status: 'PROCESS',
        phase: 'DISPATCH',
        attempt: {$lt: maxAttempt},
      })
      .sort({attempt: 1})
      .select({
        attempt: 1,
        status: 1,
        payment: 1,
        phase: 1,
        paymentDate: 1,
      })
      .lean();

    if (!queue || !queue._id ) {
      return restartService(dispatchOrderProcess, delay, serviceName);
    }

    const {data: paymentResponse} =
      await apiEconomizeBr.get(`/payment/${queue.payment}?order=true`);

    if (!paymentResponse || !paymentResponse._id) {
      await updateAttemps(queue);
      return restartService(dispatchOrderProcess, delay, serviceName);
    }

    if (
      !paymentResponse.order || !paymentResponse.order._id ||
      !paymentResponse.customer || !paymentResponse.customer.person
    ) {
      await updateAttemps(queue);
      return restartService(dispatchOrderProcess, delay, serviceName);
    }

    const customerResponse =
      await customer(paymentResponse, queue, serviceName, 'DISPATCH');

    if (!customerResponse) {
      await updateAttemps(queue);
      return restartService(dispatchOrderProcess, delay, serviceName);
    }


    const companyInput =
      await companyCustomerInput(
        paymentResponse, queue, paymentResponse.company, serviceName,
      );

    if (!companyInput) {
      await updateAttemps(queue);
      return restartService(dispatchOrderProcess, delay, serviceName);
    }

    const companyOutput =
      await companyToCompanyOutput(
        paymentResponse, queue,
        paymentResponse.company,
        queueConfig.ecbrId,
        serviceName,
      );

    if (!companyOutput) {
      await updateAttemps(queue);
      return restartService(dispatchOrderProcess, delay, serviceName);
    }

    // Ir para o próximo estagio
    await QueueSplit.updateOne({_id: queue._id}, {
      phase: 'DELIVERYMAN',
    });

    // Iniciar serviço novamente
    return dispatchOrderProcess();
  } catch (err) {
    captureError(`${serviceName}`, err);
    return restartService(dispatchOrderProcess, delay, serviceName);
  }
}

export default dispatchOrderProcess;
