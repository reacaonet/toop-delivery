const AccessFlowModel = require('../../models/Access/AccessFlowModel');
const LogModel = require('../../models/LogModel');

const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    let campaign = await AccessFlowModel.create(data);

    return res.send({
      status: 200,
      message: "Fluxo de acesso criado com sucesso",
      data: campaign
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Access/CreateController.js',
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
      message: "Falha ao criar fluxo de acesso",
      Error: dadosDoErro
    });
  }
};