const moment = require("moment");
const mongoose = require('mongoose');
const DeliveryManOnline = require('../../../models/DeliveryMan/DeliveryManOnlineModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {

    const { deliveryMan } = req.params;

    if (!deliveryMan || !mongoose.isValidObjectId(deliveryMan)) {
      return res.status(400).send({
        message: 'Informe um entregador válido!!'
      });
    }

    const deliveryManOnline = await DeliveryManOnline.findOne({ deliveryMan: deliveryMan, offline: null });

    if (!deliveryManOnline) {
      return res.status(400).send({
        message: 'Não foi possível encontrar um registro.'
      });
    }

    deliveryManOnline.offline = new Date();

    const start = moment(deliveryManOnline.online);
    const end = moment(deliveryManOnline.offline);

    const response = await DeliveryManOnline.findOneAndUpdate(
      { _id: deliveryManOnline._id }, {
      online: deliveryManOnline.online,
      offline: deliveryManOnline.offline,
      total: end.diff(start, 'minutes')
    }, {
      upsert: true
    });

    if (!response) {
      return res.status(400).send({
        message: 'Não foi possível deixar o entregador Offline.'
      });
    }

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/Online/UpdateController.js',
      error: err?.message,
      method: 'UpdateController',
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
      message: 'Erro ao deixar o entregador offline.',
      err: err.message,
    });
  }
};
