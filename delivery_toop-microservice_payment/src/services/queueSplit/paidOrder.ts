import apiEconomizeBr from '../apiEconomizeBr';
import QueueSplit from '../../models/QueueSplit';
import Invoice from '../../models/Invoice';
import restartService from './restartService';
import captureError from './error/captureError';

const delay = 15000;
const serviceName = 'paidOrderProcess';
const ecbrId = '5eb311b4161dd2f719517d62';
const maxAttempt = 10;

async function customer(payment: any, queue: any): Promise<boolean> {
  try {
    // Verifica se item já foi adicionado
    const verifyInvoice = await Invoice.findAll({
      where: {
        payment: payment._id,
        typeInvoice: 'OUTPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerPerson: payment.customer.person,
        company: ecbrId,
      },
    });

    if (Object.keys(verifyInvoice).length > 0) {
      return true;
    }

    const output: any = {};
    output.payment = payment._id;
    output.order = payment.order._id;
    output.ownerPerson = payment.customer.person;
    output.company = '5eb311b4161dd2f719517d62'; // Id do EconomizeBR
    output.shoppingCart = payment.shoppingCart._id,
    output.amount = payment.total;
    output.totalPayment = payment.total;
    output.typeInvoice = 'OUTPUT';
    output.statusInvoice = 'WAITING';

    if (queue && queue.paymentDate) {
      output.paymentDate = queue.paymentDate;
    }

    const newInvoice: any = await Invoice.create(output);

    if (!newInvoice || !newInvoice.id) {
      return false;
    }

    return true;
  } catch (err) {
    captureError(`${serviceName} - customer`, err);
    return false;
  }
}

async function ecbrCompany(payment: any, queue: any): Promise<boolean> {
  try {
    // Verifica se item já foi adicionado
    const verifyInvoice = await Invoice.findAll({
      where: {
        payment: payment._id,
        typeInvoice: 'INPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerCompany: ecbrId,
        person: payment.customer.person,
      },
    });

    if (Object.keys(verifyInvoice).length > 0) {
      return true;
    }

    const input: any = {};
    input.payment = payment._id;
    input.order = payment.order._id;
    input.ownerCompany = ecbrId;
    input.person = payment.customer.person;
    input.shoppingCart = payment.shoppingCart._id,
    input.amount = payment.total;
    input.totalPayment = payment.total;
    input.typeInvoice = 'INPUT';
    input.statusInvoice = 'WAITING';

    if (queue && queue.paymentDate) {
      input.paymentDate = queue.paymentDate;
    }

    const newInvoice: any = await Invoice.create(input);

    if (!newInvoice || !newInvoice.id) {
      return false;
    }

    return true;
  } catch (err) {
    captureError(`${serviceName} - ecbrCompany`, err);
    return false;
  }
}

async function company(payment: any, queue: any): Promise<boolean> {
  try {
    const totalCompany = payment.totalCompany;
    // const {data: companyResponse}: any = await apiEconomizeBr.get(
    //   `/company/company-delivery/${payment.company}`);

    // if (!companyResponse || companyResponse.length <= 0) {
    //   return false;
    // }

    // const mdr = companyResponse[0].mdr;
    // const fee = companyResponse[0].fee;

    // if (mdr && mdr > 0) {
    //   totalCompany = totalCompany - mdr;
    // }

    // if (fee && fee > 0) {
    //   totalCompany = totalCompany - ((totalCompany * fee) / 100);
    // }

    // OUTPUT ECBR
    const invoiceOutput = await Invoice.findAll({
      where: {
        payment: payment._id,
        shoppingCart: payment.shoppingCart._id,
        typeInvoice: 'OUTPUT',
        ownerCompany: ecbrId,
        company: payment.company,
      },
    });

    // OUTPUT ECBR
    if (Object.keys(invoiceOutput).length <= 0) {
      const output: any = {};
      output.payment = payment._id,
      output.order = payment.order._id;
      output.ownerCompany = ecbrId;
      output.company = payment.company;
      output.shoppingCart = payment.shoppingCart._id,
      output.amount = totalCompany;
      output.totalPayment = payment.total;
      output.typeInvoice = 'OUTPUT';
      output.statusInvoice = 'WAITING';

      if (queue && queue.paymentDate) {
        output.paymentDate = queue.paymentDate;
      }

      const newOutput: any = await Invoice.create(output);

      if (!newOutput || !newOutput.id) {
        return false;
      }
    }

    // Add Input Company
    const verifyInvoice = await Invoice.findAll({
      where: {
        payment: payment._id,
        shoppingCart: payment.shoppingCart._id,
        typeInvoice: 'INPUT',
        ownerCompany: payment.company,
        company: ecbrId,
      },
    });

    // Add Input Company
    if (Object.keys(verifyInvoice).length <= 0) {
      // Input Company
      const input: any = {};
      input.payment = payment._id;
      input.order = payment.order._id;
      input.ownerCompany = payment.company;
      input.company = ecbrId;
      input.shoppingCart = payment.shoppingCart._id,
      input.amount = totalCompany;
      input.totalPayment = payment.total;
      input.typeInvoice = 'INPUT';
      input.statusInvoice = 'WAITING';

      if (queue && queue.paymentDate) {
        input.paymentDate = queue.paymentDate;
      }

      const newInvoice: any = await Invoice.create(input);

      if (!newInvoice || !newInvoice.id) {
        return false;
      }
    }

    return true;
  } catch (err) {
    captureError(`${serviceName} - company`, err);
    return false;
  }
}

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
async function paidOrderProcess(): Promise<void> {
  try {
    const queue: any = await QueueSplit
      .findOne({
        status: 'PROCESS',
        phase: 'PAID_ORDER',
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
      return restartService(paidOrderProcess, delay, serviceName);
    }

    const {data: paymentResponse} =
      await apiEconomizeBr.get(`/payment/${queue.payment}?order=true`);

    if (!paymentResponse || !paymentResponse._id) {
      await updateAttemps(queue);
      return restartService(paidOrderProcess, delay, serviceName);
    }

    if (
      !paymentResponse.order || !paymentResponse.order._id ||
      !paymentResponse.customer || !paymentResponse.customer.person
    ) {
      await updateAttemps(queue);
      return restartService(paidOrderProcess, 5000, serviceName);
    }

    const customerResponse = await customer(paymentResponse, queue);

    if (!customerResponse) {
      await updateAttemps(queue);
      return restartService(paidOrderProcess, delay, serviceName);
    }

    const ecbrCompanyResponse = await ecbrCompany(paymentResponse, queue);

    if (!ecbrCompanyResponse) {
      await updateAttemps(queue);
      return restartService(paidOrderProcess, delay, serviceName);
    }

    const companyResponse = await company(paymentResponse, queue);
    if (!companyResponse) {
      await updateAttemps(queue);
      return restartService(paidOrderProcess, delay, serviceName);
    }

    // Ir para o próximo estagio
    await QueueSplit.updateOne({_id: queue._id}, {
      phase: 'DELIVERYMAN',
    });

    // Iniciar serviço novamente
    return paidOrderProcess();
  } catch (err) {
    captureError(`${serviceName}`, err);
    return restartService(paidOrderProcess, delay, serviceName);
  }
}

export default paidOrderProcess;
