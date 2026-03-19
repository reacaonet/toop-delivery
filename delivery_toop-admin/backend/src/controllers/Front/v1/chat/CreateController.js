const mongoose = require('mongoose');
const ChatMessage = require('../../../../models/chatMessageModel');
const ShoppingCart = require('../../../../models/Shopping/CartModel');
const Customer = require('../../.../../../../models/CustomerModel');
const LogModel = require('../../.../../../../models/LogModel');
const database = require('../../../../services/firebase');
const notificationApi = require('../../../../services/notification');

/**
 * POST
 * url - /v1/front/chat/:cartId
*/
const create = async (req, res) => {
  try {
    let filter = {};
    const data = req.body;
    const order = data.order_number;
    const messages = await ChatMessage.create(data);
    const shoppingCart = await ShoppingCart.findById(data.shoppingCart);

    if (order) {
      await database
        .ref()
        .child(`${process.env.FIREBASE_PATH}chat/company/${shoppingCart.company._id}`)
        .set({
          random: Math.random() * 1000,
          order,
        });
    } else {
      await database
        .ref()
        .child(`${process.env.FIREBASE_PATH}chat/company/${shoppingCart.company._id}`)
        .set({
          random: Math.random() * 1000,
        });
    }

    setTimeout(async () => {
      await database
        .ref()
        .child(`${process.env.FIREBASE_PATH}chat/company/${shoppingCart.company._id}`)
        .remove();
    }, 1000);

    // Código abaixo mantido por ser usado abaixo das versões 1.0.45
    await database
      .ref()
      .child(
        `${process.env.FIREBASE_PATH}chat/cart/${data.shoppingCart}`
      )
      .set({
        random: Math.random() * 1000,
        message: data.message,
      });

    const personId = messages.personSendId;
    const personSend = messages.personSend;

    await notificationCustomer(personId, personSend);
    return res.status(200).send(messages);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Front/v1/chat/CreateController.js',
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
      message: 'Fail create order',
      err: err.message,
    });
  }
};

const messageDefault = (flag) => {
  if (!flag || flag === null) {
    return 'Você recebeu uma nova mensagem no Chat';
  }

  if (flag === 'ADD_PRODUCT') {
    return 'Produto Adicionado em seu pedido';
  }

  if (flag === 'REMOVE_PRODUCT') {
    return 'Produto Removido em seu pedido';
  }

  return 'Você recebeu uma nova mensagem';
};

const notificationCustomer = async (
  personId,
  personSend,
) => {
  try {
    if (personSend !== 'customer') {
      return;
    }

    let sendUser = await Customer.findById(personId).lean();
    if (!sendUser || !sendUser._id || !sendUser.token) {
      logRegister({
        customer: personId,
        message: 'Usuário sem Token para recebimento de mensagem'
      }, 'notificationCustomer');
      return;
    }

    await notificationApi.post(`/v1/app-notification/user/${personId}`, {
      user: {
        auth: sendUser.token,
        message: 'Você recebeu uma nova mensagem',
      }
    });
  } catch (err) {
    logRegister(err, 'chat-notificationCustomer');
  }
}

const logRegister = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: 'notification-front-user-chat',
      originError: originError,
    });
  } catch (err) {
    // console.log('Opps fail create log', err);
  }
};

module.exports = create;
