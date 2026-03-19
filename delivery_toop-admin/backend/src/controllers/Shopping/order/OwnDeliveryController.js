const mongoose = require('mongoose');
const OrderStatus = require('../../../models/Shopping/order/orderStatusModel');
const LogModel = require("../../../models/LogModel");

const allowed = async (req, res) => {
  try {
    const { order } = req.params;

    if (!order || !mongoose.isValidObjectId(order)) {
      return res.status(400).send({
        message: 'Inform order',
        status: false,
      });
    }

    const response = await OrderStatus
      .findById(order)
      .populate('companyDelivery', { own_delivery: 1 })
      .select({
        typePayment: 1,
        companyDelivery: 1,
      })
      .lean();

    if (!response || !response.typePayment || !response.companyDelivery || !response.companyDelivery.own_delivery) {
      return res.status(200).send({
        message: 'no own delivery',
        status: false,
      });
    }

    // Pagamento feito pelo ECBR
    if (response.companyDelivery.own_delivery === true) {
      return res.status(200).send({
        response: response,
        status: true,
      });
    }

    return res.status(200).send({
      status: false,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/OwnDeliveryController.js',
      error: err?.message,
      method: 'allowed',
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

    return res.status(400).send({
      message: 'Allow fail',
      err: err.message,
      status: false,
    });
  }
};

module.exports = { allowed };
