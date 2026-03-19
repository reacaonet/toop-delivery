const mongoose = require("mongoose");

const CostCenterModel = require("../../../models/Finance/CostCenterModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { isRoot, franchise } = req;

    const data = req.body;

    if (!data.name) {
      return res.status(400).send({
        message: "Informe um nome Válido",
      });
    }

    if (!isRoot) {
      data.franchise = franchise;
    }

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    delete data._id;

    const centro = await CostCenterModel.create(data);

    return res.send({
      status: 200,
      message: "Centro de Custo criado com sucesso",
      data: centro,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/CostCenter/CreateController.js',
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
      message: "Falha ao criar Centro de Custo",
      Error: dadosDoErro,
    });
  }
};
