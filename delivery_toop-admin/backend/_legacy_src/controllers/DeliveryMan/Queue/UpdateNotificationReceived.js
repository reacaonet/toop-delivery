const mongoose = require('mongoose');
const QueueModel = require('../../../models/DeliveryMan/QueueDeliveryManModel')
const LogModel = require("../../../models/LogModel");

const notificationReceived = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryMan } = req.body;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).send({
        message: 'Informe um pedido válido',
      });
    }

    if (!deliveryMan || mongoose.isValidObjectId(deliveryMan) === false) {
      return res.status(400).send({
        message: 'Informe um delivery válido',
      });
    }

    const queue = await QueueModel.findOne({ order: orderId }).lean();

    if (!queue || !queue._id) {
      return res.status(400).send({
        message: 'Informe um pedido válido',
      });
    }

    let received = [];
    if (queue.notificationReceived && queue.notificationReceived.length) {
      received = queue.notificationReceived;
    }

    received.push(deliveryMan);
    await QueueModel.updateOne({ _id: queue._id }, {
      notificationReceived: received
    });

    return res.status(200).send({
      'message': 'Atualizado com sucesso!!'
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/Queue/UpdateNotificationReceived.js',
      error: err?.message,
      method: 'notificationReceived',
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
      message: 'Não foi possível atualizar informação',
      err: err.message,
    });
  }
};

module.exports = notificationReceived;
