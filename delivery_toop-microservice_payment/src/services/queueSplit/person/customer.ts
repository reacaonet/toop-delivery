import Invoice from '../../../models/Invoice';
import captureError from '../error/captureError';
import queueConfig from '../../../config/queueConfig.json';
import moment from 'moment';

async function input(
  payment: any,
  queue: any,
  type: string,
  serviceName: string,
): Promise<boolean> {
  try {
    const countInvoice = await Invoice.count({
      where: {
        payment: payment._id,
        typeInvoice: 'INPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerPerson: payment.customer.person,
        company: queueConfig.ecbrId,
      },
    });

    if (countInvoice > 0) {
      return true;
    }

    const input: any = {};
    input.payment = payment._id;
    input.order = payment.order._id;
    input.ownerPerson = payment.customer.person;
    input.company = queueConfig.ecbrId; // Id do EconomizeBR
    input.shoppingCart = payment.shoppingCart._id,
    input.amount = payment.total;
    input.totalPayment = payment.total;
    input.typeInvoice = 'INPUT';
    input.statusInvoice = 'WAITING';

    if (queue && queue.paymentDate) {
      input.paymentDate = moment(queue.paymentDate).utc().format();
      console.log('queue.paymentDate', queue.paymentDate);
      console.log('paymentDate', input.paymentDate);
    }

    const newInvoice: any = await Invoice.create(input);

    if (!newInvoice || !newInvoice.id) {
      return false;
    }

    return true;
  } catch (err) {
    captureError(`${serviceName} - customer-input`, err);
    return false;
  }
};


async function output(
  payment: any,
  queue: any,
  type: string,
  serviceName: string,
): Promise<boolean> {
  try {
    let company = queueConfig.ecbrId;
    // O dinheiro está indo diretamente ao estabelecimento
    if (type === 'DISPATCH') {
      company = payment.company;
    }

    const countInvoice = await Invoice.count({
      where: {
        payment: payment._id,
        typeInvoice: 'OUTPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerPerson: payment.customer.person,
        company: company,
      },
    });

    if (countInvoice > 0) {
      return true;
    }

    const output: any = {};
    output.payment = payment._id;
    output.order = payment.order._id;
    output.ownerPerson = payment.customer.person;
    output.company = company;
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
    captureError(`${serviceName} - customer-output`, err);
    return false;
  }
};

async function customer(
  payment: any,
  queue: any,
  serviceName: string,
  type: string,
): Promise<boolean> {
  try {
    // const inputResponse = await input(payment, queue, serviceName);

    // if (!inputResponse) {
    //   return false;
    // }

    const outputResponse = await output(payment, queue, type, serviceName);
    if (!outputResponse) {
      return false;
    }

    return true;
  } catch (err) {
    captureError(`${serviceName} - customer`, err);
    return false;
  }
}

export default customer;
