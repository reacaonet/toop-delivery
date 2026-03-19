
/** Model */
const CustomerModel = require('../../../../models/CustomerModel');
const PaymentMethod = require('../../../../models/Shopping/PaymentMethodModel');
const Payment = require('../../../../models/Shopping/PaymentModel');
const LogModel = require("../../../../models/LogModel");

/** Util */
const customerData = require('./util/customerData');
const paymentData = require('./util/paymentData');
const validatePayment = require('../util/validatePayment');
const logPayment = require('../util/logPayment');

/** Service */
const Cielo = require('../../../../services/Payment/Cielo');
const paymentApi = require('../../../../services/paymentApi');

let paymentType = 'SplittedCreditCard';
let capture = true;
let provider = process.env.PROVIDER_PAYMENT_CIELO;
let typePayment = "BRASPAG";

const createPayment = async (payment, totalDif) => {
  try {
    const customerDB = await CustomerModel.findById(payment.customer).populate({
      path: "person",
      select: {
        email: 1,
        phone: 1,
        name: 1,
      }
    }).lean();

    const paymentMethod = await PaymentMethod.findOne({
      customer: payment.customer,
      isMain: true,
    }).lean();

    const customerCielo = customerData(customerDB, paymentMethod);

    const paymentCielo = paymentData(
      paymentType,
      capture,
      provider,
      totalDif,
      paymentMethod,
      customerDB,
    );

    const cieloData = {
      MerchantOrderId: payment.shoppingCart,
      Customer: customerCielo,
      Payment: paymentCielo,
    };

    const respPayment = await sales(cieloData); // Realizar Pagamento
    if (validatePayment(respPayment, {}) === false) {
      logPayment({
        cieloData,
        totalDif,
        respPayment,
        payment,
      }, 'sales Braspag');

      return {
        status: false,
        message: 'Não foi possível concluir a compra por favor verifique o método de pagamento selecionado',
        cieloData,
        respPayment,
      };
    }

    //Status Payment
    let statusResponse = 'REFUSED';
    if (respPayment.Payment.Status === 1 || respPayment.Payment.Status === 2) {
      statusResponse = 'APPROVED';
    }

    let statusMessage = Cielo.sales.statusPay(respPayment.Payment.Status);

    const paymentCreate = await Payment.create({
      customer: payment.customer,
      shoppingCart: payment.shoppingCart,
      company: payment.company,
      total: totalDif,
      totalCompany: totalDif,
      priceDelivery: 0,
      serviceCharge: 0,
      deliveryAddress: payment.deliveryAddress,
      provider,
      paymentProviderId: respPayment.Payment.PaymentId,
      payload: respPayment,
      statusPayload: respPayment.Payment.Status,
      capture,
      typePayment,
      status: statusResponse,
    });

    return {
      status: statusResponse === 'APPROVED' ? true : false,
      paymentId: paymentCreate._id,
      message: statusMessage,
    }
  } catch (err) {
    // console.log('Fail payment', err);
    return {
      status: false,
      message: 'Falha ao processar pagamento',
      err: err.message,
    };
  }
};

const sales = async (payData) => {
  try {
    const { data: response } = await paymentApi.post('/sales', payData);
    return response.data;
  } catch (err) {
    let error = err.message;
    if (err.response && err.response.data) {
      error = err.response.data;
    }

    return false;
  }
}

const partialChargeback = async (payment, totalDif) => {
  try {
    const { data: response } = await paymentApi.put(
      `/cancellation-partial/${payment.paymentProviderId}`,
      {
        payload: [
          {
            SubordinateMerchantId: null, // setado como nulo o Micro-Service irá setar como default o Id ECBR
            VoidedAmount: totalDif * 100,
          }
        ],
        amount: totalDif * 100,
      }
    );

    if (!response.data) {
      return {
        status: false,
        message: 'Sem o response'
      };
    }

    const chargeBackResponse = response.data;

    if (
      !chargeBackResponse ||
      chargeBackResponse.Status !== 2 ||
      !chargeBackResponse.Tid || !chargeBackResponse.AuthorizationCode ||
      !chargeBackResponse.VoidSplitPayments) {

      logPayment({
        totalDif: totalDif,
        payment,
        chargeBackResponse: chargeBackResponse,
      }, 'chargeBack parcial Braspag');

      return {
        status: false,
        message: 'Não foi possível estornar valor informado'
      }
    }

    await Payment.updateOne({ _id: payment._id }, {
      partialChargeback: totalDif,
      partialChargebackPayload: chargeBackResponse,
    });

    return {
      status: true,
      message: 'Estornado com sucesso!!'
    }

  } catch (err) {
    let error = err.message;
    if (err.response && err.response.data) {
      error = err.response.data;
    }

    return {
      status: false,
      message: 'Falha ao processar pagamento',
      err: error,
    };
  }
};


module.exports = { createPayment, partialChargeback };
