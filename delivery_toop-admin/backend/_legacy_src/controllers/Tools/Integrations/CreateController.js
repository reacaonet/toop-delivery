
const mongoose = require('mongoose');

const IntegrationsModel = require('../../../models/tools/IntegrationsModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    console.log('dados integration', data)

    let Integration = await IntegrationsModel.create(data);

    return res.send({
      status: 200,
      message: "Tipos de Pagamento criado com sucesso",
      data: Integration
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Tools/Integrations/CreateController.js',
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
      message: "Falha ao criar tipos de pagamento",
      Error: dadosDoErro
    });
  }
};

