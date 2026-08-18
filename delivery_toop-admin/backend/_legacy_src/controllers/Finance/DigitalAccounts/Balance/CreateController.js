const mongoose = require("mongoose");

const bankTransactions = require("../../../../services/Finance/DigitalAccounts/BankTransactions");
const AccountBalanceCron = require("../../../../cron/accountBalance");
const LogModel = require('../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (!data.destinationAgency || !mongoose.Types.ObjectId.isValid(data.destinationAgency)) {
      return res.status(400).send({
        message: "Informe um agencia Válida",
      });
    }

    if (!data.destinationAccount || !mongoose.Types.ObjectId.isValid(data.destinationAccount)) {
      return res.status(400).send({
        message: "Informe uma conta Válida",
      });
    }

    const success = await bankTransactions({
      destinationAgency: data.destinationAgency,
      destinationAccount: data.destinationAccount,
      value: data.value,
      type: data.type,
      status: data.status,
      costCenter: data.costCenter,
      description: data.description,
    });

    await AccountBalanceCron.createBalance();

    if (success) {
      return res.send({
        status: 200,
        message: "Transação criada com sucesso",
        data: success,
      });
    } else {
      return res.status(400).send({
        message: "Erro ao inserir balanco",
      });
    }
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Balance/CreateController.js',
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
      message: "Falha ao criar Transação",
      Error: dadosDoErro,
    });
  }
};
