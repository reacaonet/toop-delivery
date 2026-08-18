/** Model */
const Payment = require('../../../../models/Shopping/PaymentModel');
const Order = require('../../../../models/Shopping/order/orderStatusModel');
const LogModel = require("../../../../models/LogModel");

const createOtherPayment = async (order, payment, dif) => {
  try {
    let idPayment = payment._id;

    delete payment._id;
    delete payment.createdAt;
    delete payment.updatedAt;
    delete payment.braspagNotification;
    delete payment.statusNotification;

    let totalCompany = payment.totalCompany;
    let total = payment.total;

    totalCompany = totalCompany + dif;
    total = total + dif;

    // Marcar anterior como cancelado
    await Payment.updateOne({ _id: idPayment }, {
      status: 'CANCELED'
    });

    // Novo Pagamento
    payment.total = total;
    payment.totalCompany = totalCompany;
    payment.status = 'AWAITING_PAYMENT';

    let newPayment = await Payment.create(payment);

    if (!newPayment || !newPayment._id) {
      return {
        status: false,
        message: 'Não foi possível gerar uma nova fatura',
      };
    }

    await Order.updateOne({ _id: order._id }, {
      payment: [newPayment._id]
    });

    return {
      status: true,
      message: 'Fatura gerada com sucesso!!',
    };
  } catch (err) {
    console.log('Error', err);

    return {
      status: false,
      message: 'Falha ao processar pagamento',
      err: err.message,
    }
  }
};

module.exports = createOtherPayment;
