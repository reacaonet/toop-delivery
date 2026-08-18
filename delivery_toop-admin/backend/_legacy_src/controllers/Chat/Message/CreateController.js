const mongoose = require("mongoose");
const notificationApi = require("../../../services/notification");
const ChatMessage = require("../../../models/chatMessageModel");
const Customer = require("../../../models/CustomerModel");
const Users = require("../../../models/UserModel");
const DeliveryMan = require("../../../models/DeliveryMan/DeliveryManModel");
const ShopperModel = require("../../../models/ShopperModel");
const ShoppingCart = require("../../../models/Shopping/CartModel");
const database = require("../../../services/firebase");
const LogModel = require("../../../models/LogModel");

const create = async (req, res) => {
  try {
    let data = req.body;
    let or = [];
    data._id = new mongoose.Types.ObjectId().toHexString();

    const chatMessage = await ChatMessage.create(data);
    if (!chatMessage || !chatMessage._id) {
      return res.status(400).send({
        message: "Não foi possível enviar mensagem",
      });
    }

    const personId = chatMessage.personSendId;
    const personSend = chatMessage.personSend;
    let flag = null;

    if (chatMessage.flag) {
      flag = chatMessage.flag;
    }

    if (chatMessage && chatMessage.shoppingCart) {
      notificationCustomer(personId, personSend, flag, chatMessage.shoppingCart, chatMessage.order_number);

      // Código abaixo mantido por ser usado abaixo das versões 1.0.45
      await database
        .ref()
        .child(`${process.env.FIREBASE_PATH}chat/cart/${chatMessage.shoppingCart}`)
        .set({
          random: Math.random() * 1000,
          message: chatMessage.message,
        });
    }

    return res.status(200).send(chatMessage);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Chat/Message/CreateController.js',
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

    console.log("oops 2", err);

    return res.status(400).send({
      err: err.message,
    });
  }
};

const createImage = async (req, res) => {
  try {
    let data = req.body;
    let or = [];
    let flag = "";

    if (data.file) {
      delete data.file;
    }

    const chatMessage = await ChatMessage.create(data);
    const personId = chatMessage.personSendId;
    const personSend = chatMessage.personSend;

    if (chatMessage.flag) {
      flag = chatMessage.flag;
    }

    if (chatMessage && chatMessage.shoppingCart) {
      notificationCustomer(personId, personSend, flag, chatMessage.shoppingCart, chatMessage.order_number);

      // Código abaixo mantido por ser usado abaixo das versões 1.0.45
      await database
        .ref()
        .child(`${process.env.FIREBASE_PATH}chat/cart/${chatMessage.shoppingCart}`)
        .set({
          random: Math.random() * 1000,
          message: "Imagem Enviada",
        });
    }
    return res.status(200).send(chatMessage);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Chat/Message/CreateController.js',
      error: err?.message,
      method: 'createImage',
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

    console.log("oops fail", err);

    return res.status(400).send({
      err: err.message,
    });
  }
};

const notificationCustomer = async (personId, personSend, flag, shoppingCartId, order) => {
  try {
    let message = messageDefault(flag);
    let list;

    if (personSend === "customer") {
      list = await Customer.findById(personId).lean();
    } else if (personSend === "shopper") {
      // Mantido assim para para manter o Id antigo
      // conflito de Id utilizado - algumas vezes estão utilizando o Person e outras id user ?
      list = await ShopperModel.findOne({ person: personId }).lean();
      if (!list) {
        list = await Users.findById(personId).lean();
        if (list && list.person) {
          list = await ShopperModel.findOne({ person: list.person }).lean();
        }
      }
    } else {
      list = await DeliveryMan.findOne({ person: `${personId}`.toString() }).lean();
      if (!list) {
        list = await DeliveryMan.findById(`${personId}`.toString()).lean();
      }
    }

    const shoppingCart = await ShoppingCart.findById(shoppingCartId);

    if (order) {
      await database
        .ref()
        .child(`${process.env.FIREBASE_PATH}chat/company/${shoppingCart?.company?._id}`)
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

    // setTimeout(async () => {
    //   await database
    //     .ref()
    //     .child(`${process.env.FIREBASE_PATH}chat/company/${shoppingCart.company._id}`)
    //     .remove();
    // }, 3000);

    if (list && list.token) {
      await notificationApi.post(`/v1/app-notification/user/${personId}`, {
        user: {
          auth: list.token,
          message: message,
        },
      });
    } else {
      logRegister(
        {
          customer: personId,
          message: "Usuário sem Token para recebimento de mensagem",
        },
        "notificationCustomer",
      );
    }
  } catch (err) {
    // console.log('error', err);
    logRegister(err, "chat-sendNotification");
  }
};

const messageDefault = flag => {
  if (!flag || flag === null) {
    return "Você recebeu uma nova mensagem no Chat";
  }

  if (flag === "ADD_PRODUCT") {
    return "Produto Adicionado em seu pedido";
  }

  if (flag === "REMOVE_PRODUCT") {
    return "Produto Removido em seu pedido";
  }

  return "Você recebeu uma nova mensagem";
};

const logRegister = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: "notification-user-chat",
      originError: originError,
    });
  } catch (err) {
    // console.log('Opps fail create log', err);
  }
};

module.exports = { create, createImage };
