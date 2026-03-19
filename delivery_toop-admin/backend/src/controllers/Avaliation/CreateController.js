const mongoose = require('mongoose');
const Avaliation = require("../../models/AvaliationModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if ( !data.order ) {
      return res.status(400).send({
        message: "A vinculação do ID do pedido é obrigatória",
      });
    }

    if ( !data.starts ) {
      return res.status(400).send({
        message: "A avaliação é obrigatória",
      });
    }

    if ( !data.idRated || !data.idEvaluator || !data.typeRated || !data.typeEvaluator ) {
      return res.status(400).send({
        message: "Os campos são obrigatórios",
      });
    }

    let avaliation = await Avaliation.create(data);

    return res.send({
      status: 200,
      message: "Avaliação criada com sucesso",
      data: avaliation
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Avaliation/CreateController.js',
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


    return res.status(400).send({
      message: "Falha ao criar avaliação",
      Error: dadosDoErro
    });
  }
};
