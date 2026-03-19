const mongoose = require("mongoose");

const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
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

    const registerUpdate = await AccountModel.findOneAndUpdate(
      { _id: id },
      data,
      { upsert: true, new: true }
    );

    res.send({
      status: 200,
      message: "Conta Bancária atualizada com sucesso",
      data: registerUpdate,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Account/UpdateController.js',
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
      message: "Falha ao Atualizar Conta Bancária",
      Error: dadosDoErro,
    });
  }
};
