const mongoose = require('mongoose');

const PaymentMethod = require('../../../models/Shopping/PaymentMethodModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { customer } = req.params;
    const { isMain, flag, isDeleted } = req.query;

    let data = {};

    if (!customer || !mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).send({
        message: 'Id do cliente inválido',
      })
    }

    data.customer = customer;

    let and = [];
    if (isMain) {
      and.push({ isMain: (isMain === 'true') ? true : false })
    }

    if (isDeleted) {
      and.push({ isDeleted: (isDeleted === 'true') && true })
    } else {
      and.push({ isDeleted: false })
    }

    if (flag) {
      and.push({ flag })
    }

    if (and.length > 0) {
      data = {
        $and: and,
        ...data
      }
    }

    const list = await PaymentMethod.find(data);

    return res.json(list)

  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Shopping/PaymentMethod/ListController.js',
      error: dadosDoErro?.message,
      method: 'ListController',
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
      message: "Falha ao listar método de pagamento",
      Error: dadosDoErro
    });
  }
};