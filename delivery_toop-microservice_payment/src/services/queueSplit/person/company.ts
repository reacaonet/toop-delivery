import Invoice from '../../../models/Invoice';
import captureError from '../error/captureError';
import queueConfig from '../../../config/queueConfig.json';

async function companyDispatch(
  payment: any, queue: any, serviceName: string,
): Promise<boolean> {
  try {
    const countInvoice = await Invoice.count({
      where: {
        payment: payment._id,
        typeInvoice: 'INPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerCompany: queueConfig.ecbrId,
        person: payment.customer.person,
      },
    });

    return true;
  } catch (err) {
    return false;
  }
}

async function companyCustomerInput(
  payment: any,
  queue: any,
  company: string,
  serviceName: string,
): Promise<boolean> {
  try {
    const countInvoice = await Invoice.count({
      where: {
        payment: payment._id,
        typeInvoice: 'INPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerCompany: company,
        person: payment.customer.person,
      },
    });

    if (countInvoice > 0) {
      return true;
    }

    const input: any = {};
    input.payment = payment._id;
    input.order = payment.order._id;
    input.ownerCompany = company;
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
    captureError(`${serviceName} - companyCustomerInput`, err);
    return false;
  }
}

async function companyToCompanyOutput(
  payment: any,
  queue: any,
  ownerCompany: string,
  company: string,
  serviceName: string,
): Promise<boolean> {
  try {
    const countInvoice = await Invoice.count({
      where: {
        payment: payment._id,
        typeInvoice: 'OUTPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerCompany: ownerCompany,
        company: company,
      },
    });

    if (countInvoice > 0) {
      return true;
    }

    const output: any = {};
    output.payment = payment._id;
    output.order = payment.order._id;
    output.ownerCompany = ownerCompany;
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
    captureError(`${serviceName} - companyToCompanyOutput`, err);
    return false;
  }
}

export {companyDispatch, companyCustomerInput, companyToCompanyOutput};
