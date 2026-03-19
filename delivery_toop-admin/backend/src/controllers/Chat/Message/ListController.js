const ChatMessage = require('../../../models/chatMessageModel');
const LogModel = require("../../../models/LogModel");
const mongoose = require('mongoose');

const list = async (req, res) => {
  try {
    const {cart, person, personSend} = req.query;
    let filter = {};
    filter.shoppingCart = cart;
    let or = [];

    if (person && personSend ) {
      or.push({
        $and:[{person: person}, {personSend: personSend}]
      });

      or.push({
        $and:[{person: personSend}, {personSend: person}]
      });
    }

    if (or.length > 0) {
      filter.$or = or;
    }

    const chatMessage = await ChatMessage.find(filter).sort({createdAt : -1});
    return res.status(200).send(chatMessage);
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Chat/Message/ListController.js',
    error: err?.message,
    method: 'list',
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
      err: err.message,
    });
  }
}

const noRead = async (req, res) => {
  try {
    const {cartId} = req.params;
    const {personId} = req.query;

    if (!cartId && !mongoose.isValidObjectId(cartId)) {
      return res.status(400).send({
        message: 'Informe um carrinho válido'
      });
    }

    if (!personId) {
      return res.status(400).send({
        message: 'Informe um usuario válido'
      });
    }

    const total =  await ChatMessage.count({
      shoppingCart: cartId,
      personSendId: personId,
      read: false
    });

    // const chatMessage = await ChatMessage.find(filter).sort({createdAt : -1});
    return res.status(200).send({
      total
    });

  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Chat/Message/ListController.js',
    error: err?.message,
    method: 'noRead',
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
      message: 'Not total :(',
    });
  }
};

module.exports = {list, noRead}
