import Invoice from '../../../models/Invoice';
import captureError from '../error/captureError';
import queueConfig from '../../../config/queueConfig.json';

async function ecbrCompany(
  payment: any, queue: any, serviceName: string,
): Promise<boolean> {
  try {
    // Verifica se item já foi adicionado
    const countInvoice = await Invoice.count({
      where: {
        payment: payment._id,
        typeInvoice: 'INPUT',
        shoppingCart: payment.shoppingCart._id,
        ownerCompany: queueConfig.ecbrId,
        person: payment.customer.person,
      },
    });

    if (countInvoice > 0) {
      return true;
    }

    const input: any = {};
    input.payment = payment._id;
    input.order = payment.order._id;
    input.ownerCompany = queueConfig.ecbrId;
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
};


export default ecbrCompany;
