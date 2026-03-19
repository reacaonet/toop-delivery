const mongoose = require('mongoose');

const ControllerModel = require('../../../models/Setting/ControllerModel');
const ModuleModel = require('../../../models/Setting/ModuleModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    let data = {};
    let list;

    list = await ModuleModel.find(data, {name: 1, status: 1}).lean();

    let index = 0;
    for await (let item of list) {
      const controllers = await ControllerModel.find({module: item._id}, {name: 1}).lean();
      console.log('aa', {...item, controllers});

      list[index] = {...item, controllers}
      index++;
    }

    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/Module/TreeModulesController.js',
    error: dadosDoErro?.message,
    method: 'TreeModulesController',
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