const mongoose = require('mongoose');
const OrderTracking = require('../../../../models/Shopping/order/orderTrackingModel');
const LogModel = require("../../../../models/LogModel");

const create = async (req, res) => {
  try {

    const dataPost = req.body;
    const orderStatus = await newOrder(dataPost);
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (orderStatus === false) {
      return res.status(400).send({
        message: 'Não foi possível salvar Ordem do pedido'
      });
    }

    return res.status(200).send(orderStatus);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/tracking/CreateController.js',
      error: err?.message,
      method: 'create',
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
      message: err.message
    })
  }
};


const newOrder = async (dataPost) => {
  try {
    const orderStatus = OrderTracking.create(dataPost);
    return orderStatus;
  } catch (err) {
    return false;
  }
};

module.exports = { create, newOrder };
