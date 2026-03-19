const IntegrationsModel = require('../../../models/tools/IntegrationsModel');
const LogModel = require("../../../models/LogModel");

const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut } = req.query;

    let filter = {};
    let list;

    filter.deletedAt = {
      $exists: false,
  }

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    list = await IntegrationsModel.find(filter)
      .populate('company', {name: 1})
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));
    let numTotal = await IntegrationsModel.find(filter).countDocuments();
    return res.json({ list, total: numTotal })
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Tools/Integrations/PaginatorController.js',
    error: dadosDoErro?.message,
    method: 'PaginatorController',
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
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};