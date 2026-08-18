const mongoose = require("mongoose");

const BankModel = require("../../../../models/Finance/DigitalAccounts/BankModel");
const LogModel = require('../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    data.status =
      (typeof data.status === "string" && data.status === "") ||
      data.status === null
        ? false
        : data.status;

    const registerUpdate = await BankModel.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    });

    res.send({
      status: 200,
      message: "Banco atualizada com sucesso",
      data: registerUpdate,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Bank/UpdateController.js',
    error: dadosDoErro?.message,
    method: 'UpdateController',
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
      message: "Falha ao Atualizar Banco",
      Error: dadosDoErro,
    });
  }
};
