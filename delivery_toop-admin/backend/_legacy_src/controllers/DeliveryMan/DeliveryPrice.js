// const Payment = require('../../models/Shopping/PaymentModel');
const OrderStatus = require('../../models/Shopping/order/orderStatusModel');
const LogModel = require("../../models/LogModel");

// Utilizado na Cron Delivery
const deliveryPrice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const response = await OrderStatus
      .findById(orderId)
      .populate('payment', {
        priceDelivery: 1,
        priceFreight: 1,
      })
      .select({ payment: 1 })
      .lean();

    if (
      response &&
      response.payment &&
      Array.isArray(response.payment) &&
      response.payment.length >= 0
    ) {
      response.payment = response.payment[response.payment.length - 1]
    }

    /** Tabela de preço  */
    // if (response && response.payment && response.payment.priceFreight) {
    //   response.payment.priceDelivery = response.payment.priceFreight
    //   delete response.payment.priceFreight;
    // }

    // Por enquanto retornar valor Default do frete
    if (!response || !response.payment || !response.payment.priceDelivery) {
      response.payment.priceDelivery = 0;
    }

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/DeliveryPrice.js',
      error: err?.message,
      method: 'deliveryPrice',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    return res.status(200).send({
      message: err.message,
    })
  }
}

module.exports = deliveryPrice;
