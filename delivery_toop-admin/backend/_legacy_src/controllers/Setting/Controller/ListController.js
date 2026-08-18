const mongoose = require('mongoose');
const Controller = require('../../../models/Setting/ControllerModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {

    const id = req.params.id;
    const {
      module,
    } = req.query;

    let data = {};

    if (module && !mongoose.Types.ObjectId.isValid(module)) {
      return res.status(400).send({
        message: 'Id do Módulo inválido',
      })
    }

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: 'ID do registro inválido'
      })
    }

    let list;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      list = await Controller.findById(id);
      return res.json(list);
    }

    if (module && mongoose.Types.ObjectId.isValid(module)) {
      data.module = module;
    } else {
      list = await Controller.find(data).populate('module');
    }

    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/Controller/ListController.js',
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
      mesage: "Falha na busca do Registro",
      error: dadosDoErro
    });
  }
};