const mongoose = require('mongoose');
const QueueModel = require('../../../models/DeliveryMan/QueueDeliveryManModel');
const DeliveryModel = require('../../../models/DeliveryMan/DeliveryManModel');
const OrderModel = require('../../../models/Shopping/order/orderStatusModel');
const LogModel = require("../../../models/LogModel");
let attempt = 0;
const attemptMax = 15;
const interval = 8000;

/**
 * PUT
 * url - /delivery-man/back-to-queue
 * order - required
 * deliveryMan - optional
*/
const backToQueue = async (req, res) => {
  try {
    req.setTimeout(0);
    const { order, deliveryMan } = req.body;
    attempt = 0;

    if (!order || !mongoose.isValidObjectId(order)) {
      return res.status(400).send({
        message: 'order not found'
      });
    }

    if (!deliveryMan || !mongoose.isValidObjectId(deliveryMan)) {
      let result = await backOrder(order);
      if (result === false) {
        return res.status(400).send({
          message: 'status could not be changed'
        });
      }

      return res.status(200).send({ message: 'successfully changed' });
    }

    // Enviar pedido para o um delivery específico
    const result = await backOrderDelivery(order, deliveryMan);

    if (result.status === false) {
      return res.status(400).send(result);
    }

    // aguardar resposta do evento
    let responseQueue = await statusQueue(order, deliveryMan);

    if (!responseQueue || responseQueue.status === false) {
      return res.status(400).send(responseQueue);
    }

    return res.status(200).send(responseQueue);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/Queue/BackToQueue.js',
      error: err?.message,
      method: 'backToQueue',
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
      message: 'Falha ao alterar fila do pedido',
      err: err.message,
    });
  }
}

const backOrder = async (order) => {
  try {
    let result = await QueueModel.findOneAndUpdate(
      { order: order },
      {
        $set: {
          attempt: 0,
          status: 'WAIT',
          deliveryManProcess: [],
        },
        $unset: { lastData: 1 }
      },
      { new: true }
    ).sort({ createdAt: -1 });

    if (result) {
      await resetDeliveryRoute(order);
    }

    return result;
  } catch (err) {
    return false;
  }
}

const backOrderDelivery = async (order, deliveryMan) => {
  try {
    let findDelivery = await DeliveryModel.findById(deliveryMan).lean();

    if (!findDelivery || !findDelivery._id) {
      return {
        status: false,
        message: 'Entregador não encontrado',
      };
    }

    if (findDelivery.flag === 'ON_ROUTE') {
      return {
        status: false,
        message: 'Entregador está em rota',
      };
    }

    if (findDelivery.flag === 'UNAVAILABLE') {
      return {
        status: false,
        message: 'Entregador marcou para não receber corridas no momento',
      };
    }

    if (findDelivery.status === false) {
      return {
        status: false,
        message: 'Entregador está com status OFFLINE',
      };
    }

    let update = await QueueModel.findOneAndUpdate(
      { order: order },
      {
        $set: {
          attempt: 0,
          status: 'WAIT',
          sendToDeliveryMan: deliveryMan,
          deliveryManProcess: [],
        },
        $unset: { lastData: 1 }
      },
      { new: true }
    ).sort({ createdAt: -1 })
      .lean();

    if (!update || update.attempt !== 0) {
      return {
        status: false,
        message: 'Não foi possível alterar status da fila'
      };
    }

    await resetDeliveryRoute(order);

    return { status: true };
  } catch (err) {
    return {
      status: false,
      message: 'Não conseguimos modificar o status da fila, por favor tente mais tarde ...',
      err: err.message,
    };
  }
};

const intervalPrommise = async () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve(true);
      }, interval);
    } catch (err) {
      resolve(true);
    }
  })
};

const statusQueue = async (order, deliveryMan) => {
  try {
    // console.log('Recursivo chamado ...');

    if (attempt >= attemptMax) {
      return {
        status: false,
        message: 'Tempo máximo de espera atingido',
      };
    }

    attempt++;
    await intervalPrommise();

    let response = await QueueModel
      .findOne({ order: order })
      .sort({ createdAt: -1 })
      .lean();

    if (response.attempt > 0) {
      let find = response.deliveryManProcess.findIndex(item => item === deliveryMan);

      if (find > -1) {
        return {
          status: true,
          message: 'Notificação enviada para Entregador com sucesso!!',
        };
      }
    }

    return await statusQueue(order, deliveryMan);
  } catch (err) {
    return {
      status: false,
      message: err.message,
    };
  }
};

const resetDeliveryRoute = async (order) => {
  try {
    if (!order) {
      return;
    }

    let orderResponse = await OrderModel
      .findById(order)
      .populate('deliveryMan', { flag: 1 })
      .select({ deliveryMan: 1 })
      .lean();

    if (!orderResponse || !orderResponse._id) {
      return;
    }

    await OrderModel.updateOne({ _id: orderResponse._id }, {
      $set: { status: 'WAIT_DELIVERYMAN' },
      $unset: { deliveryMan: 1 }
    });

    if (!orderResponse.deliveryMan || !orderResponse.deliveryMan._id) {
      return;
    }

    // Colocar o Delivery man como livre
    const deliveryMan = orderResponse.deliveryMan;
    if (deliveryMan.flag && deliveryMan.flag === 'ON_ROUTE') {
      await DeliveryModel.updateOne({ _id: deliveryMan._id }, {
        $set: { flag: 'FREE' }
      });
    }
  } catch (err) {
    console.log('Error resetDeliveryRoute', err);
    return;
  }
};

module.exports = backToQueue;
