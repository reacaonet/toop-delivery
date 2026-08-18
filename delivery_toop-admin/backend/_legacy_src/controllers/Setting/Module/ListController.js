const mongoose = require('mongoose');
const ModuleModel = require('../../../models/Setting/ModuleModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {

    const _id = req.params.id;
    let data = {};

    if (_id && !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send({
        message: 'ID inválido'
      })
    }

    let list;
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      data._id = _id;
    }

    list = await ModuleModel.find(data);

    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/Module/ListController.js',
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
      mesage: "Falha na busca de registro",
      error: dadosDoErro
    });
  }
};