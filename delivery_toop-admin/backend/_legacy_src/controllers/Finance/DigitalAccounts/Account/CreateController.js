const mongoose = require("mongoose");

const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
const nextCode = require("./../../../../services/Finance/DigitalAccounts/nextCode");
const LogModel = require('./../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (!data.bank || !mongoose.Types.ObjectId.isValid(data.bank)) {
      return res.status(400).send({
        message: "Id do Banco inválido!",
      });
    }

    if (!data.agency || !mongoose.Types.ObjectId.isValid(data.agency)) {
      return res.status(400).send({
        message: "Informe uma agência Válida",
      });
    }

    if (!data.holder || !mongoose.Types.ObjectId.isValid(data.holder)) {
      return res.status(400).send({
        message: "Informe um titular Válido",
      });
    }

    data.status = true;

    // obtem o proximo código da agência
    data.code = await nextCode.nextCodeAccount(data.bank, data.agency);
    const account = await AccountModel.create(data);

    return res.send({
      status: 200,
      message: "Conta Bancária criada com sucesso",
      data: account,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Account/CreateController.js',
    error: dadosDoErro?.message,
    method: 'CreateController',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      message: "Falha ao criar Conta Bancária",
      Error: dadosDoErro,
    });
  }
};
