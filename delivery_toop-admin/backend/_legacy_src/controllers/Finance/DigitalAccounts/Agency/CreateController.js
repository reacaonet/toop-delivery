const mongoose = require("mongoose");

const AgencyModel = require("../../../../models/Finance/DigitalAccounts/AgencyModel");
const nextCode = require("./../../../../services/Finance/DigitalAccounts/nextCode");
const LogModel = require('../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (!data.franchise || !mongoose.Types.ObjectId.isValid(data.franchise)) {
      return res.status(400).send({
        message: "Id da Franquia inválido!",
      });
    }

    if (!data.bank) {
      return res.status(400).send({
        message: "Informe um banco Válido",
      });
    }

    if (!data.name) {
      return res.status(400).send({
        message: "Informe um nome Válido",
      });
    }

    // obtem o proximo código da agência
    data.code = await nextCode.nextCodeAgency();

    const agency = await AgencyModel.create(data);

    return res.send({
      status: 200,
      message: "Agência criada com sucesso",
      data: agency,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Agency/CreateController.js',
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
      message: "Falha ao criar Agência",
      Error: dadosDoErro,
    });
  }
};
