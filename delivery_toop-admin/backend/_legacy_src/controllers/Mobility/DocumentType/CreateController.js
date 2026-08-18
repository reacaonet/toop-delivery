const mongoose = require('mongoose');

const DocumentTypeModel = require('../../../models/Mobility/DocumentType/DocumentTypeModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    // Trata status
    data.status = true;

    const item = await DocumentTypeModel.create(data);

    return res.send({
      status: 200,
      message: 'Tipo de documento criado com sucesso',
      data: item,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/DocumentType/CreateController.js',
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
      message: 'Falha ao criar Tipo de documento',
      Error: dadosDoErro,
    });
  }
};
