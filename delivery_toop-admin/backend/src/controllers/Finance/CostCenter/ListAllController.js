const CostCenterModel = require("../../../models/Finance/CostCenterModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const list = await CostCenterModel.find();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/CostCenter/ListAllController.js',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      message: "Falha ao lista todos os centro de custos",
      Error: dadosDoErro.message,
    });
  }
};
