const mongoose = require("mongoose");

const BankModel = require("../../../../models/Finance/DigitalAccounts/BankModel");
const LogModel = require('../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    data.status = true;

    if (!data.name) {
      return res.status(400).send({
        message: "Informe um nome Válido",
      });
    }

    const bank = await BankModel.create(data);

    return res.send({
      status: 200,
      message: "Banco criada com sucesso",
      data: bank,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Bank/CreateController.js',
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


    return res.status(400).send({
      message: "Falha ao criar Banco",
      Error: dadosDoErro,
    });
  }
};
