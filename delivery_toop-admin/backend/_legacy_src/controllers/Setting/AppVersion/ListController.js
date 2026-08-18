const mongoose = require("mongoose");
const AppVersion = require("../../../models/Setting/AppVersionModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    let filter = {};

    filter.deletedAt = {
      $exists: false,
    };

    const list = await AppVersion.find(filter).sort({ createdAt: -1 });
    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/AppVersion/ListController.js',
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
      mesage: "Falha na busca de Versão",
      error: dadosDoErro,
    });
  }
};
