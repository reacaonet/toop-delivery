const mongoose = require('mongoose');

const TypesUsers = require('../../../models/Setting/TypesUsersModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {

    const typesUsers = req.params.id;

    let data = {};

    data.deletedAt = {
      $exists: false,
  }

    if (typesUsers && !mongoose.Types.ObjectId.isValid(typesUsers)) {
      return res.status(400).send({
        message: 'ID inválido'
      })
    }

    let list;
    if (typesUsers && mongoose.Types.ObjectId.isValid(typesUsers)) {
      data.typesUsers = typesUsers;
    } else {
      list = await TypesUsers.find(data)
        .populate('typesUsers', { name: 1, status: 1 });

    }
    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Setting/TypesUsers/ListController.js',
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