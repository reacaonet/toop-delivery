const mongoose = require('mongoose');
const QueueModel = require('../../../models/DeliveryMan/QueueDeliveryManModel')
const LogModel = require("../../../models/LogModel");

const updateStatus = async (req, res) => {
  try {

    const { queueId } = req.params;
    const { status } = req.body;

    if (!queueId || !mongoose.isValidObjectId(queueId)) {
      return res.status(400).send({
        message: 'Informe uma fila válida!!'
      });
    }

    if (!status) {
      return res.status(400).send({
        message: 'Informe uma Status!!'
      });
    }

    const response = await QueueModel.findOneAndUpdate({ _id: queueId }, {
      status
    }, {
      upsert: true
    });

    if (!response) {
      return res.status(400).send({
        message: 'Não foi possível alterar informações'
      });
    }

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/Queue/UpdateController.js',
      error: err?.message,
      method: 'updateStatus',
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

    // console.log('err', err);
    return res.status(400).send({
      message: 'Fail change status queue DeliveryMan',
      err: err.message,
    });
  }
};

const updateDeliveryQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    const {
      attempt,
      deliveryMan,
      lastData,
      deliveryManProcess,
      historicDeliveryMan,
      status,
    } = req.body;

    let dataAlt = {};

    if (!mongoose.isValidObjectId(deliveryMan)) {
      return res.status(400).send({
        message: 'Informe um Delivery válido'
      });
    }

    if (!attempt || !historicDeliveryMan || !deliveryManProcess) {
      return res.status(400).send({
        message: 'Informe todos os campos necessário para atualizar da fila'
      });
    }

    dataAlt.attempt = attempt;
    dataAlt.historicDeliveryMan = historicDeliveryMan;
    dataAlt.deliveryManProcess = deliveryManProcess;

    if (status) {
      dataAlt.status = status;
    }

    if (lastData) {
      dataAlt.lastData = lastData;
    }

    if (deliveryMan) {
      dataAlt.deliveryMan = deliveryMan;
    }

    const response = await QueueModel.findOneAndUpdate({ _id: queueId }, dataAlt, {
      upsert: true
    });

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/Queue/UpdateController.js',
      error: err?.message,
      method: 'updateDeliveryQueue',
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
      message: 'Fail Update Delivery Queue',
      err: err.message,
    });
  }
};

module.exports = { updateStatus, updateDeliveryQueue };
