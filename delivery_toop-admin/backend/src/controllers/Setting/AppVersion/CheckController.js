const mongoose = require("mongoose");
const AppVersion = require("../../../models/Setting/AppVersionModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { version, platform } = req.query;

    if (!version && !platform) {
      return res.status(400).send({
        mesage: "Parametros não informados",
      });
    }

    let filter = {};
    filter.deletedAt = {
      $exists: false,
    };
    filter.status = true;
    filter.platform = platform;

    const last = await AppVersion.findOne(filter).sort({ createdAt: -1 });
    if (last) {
      if (last.version === version) {
        return res.json({ forceUpdate: false, version: last.version, platform: last.platform });
      } else {
        return res.json({ forceUpdate: true, version: last.version, platform: last.platform });
      }
    } else {
      return res.status(400).send({
        mesage: "Nenhuma versão criada",
      });
    }
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/AppVersion/CheckController.js',
    error: dadosDoErro?.message,
    method: 'CheckController',
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
      mesage: "Falha ao checar Versão",
      error: dadosDoErro,
    });
  }
};
