const PeakHourModel = require('../../../models/Mobility/PeakHour/PeakHourModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const list = await PeakHourModel.find();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/PeakHour/ListAllController.js',
    error: dadosDoErro?.message,
    method: 'ListAllController',
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
      message: 'Falha ao listar todos os registros',
      Error: dadosDoErro.message,
    });
  }
};
