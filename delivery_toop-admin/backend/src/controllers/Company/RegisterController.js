const Company = require("../../models/Company/CompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (data.bankData) {
      if (data.bankData.pixType === null || data.bankData.pixType === undefined) {
        delete data.bankData.pixType
      }
    }

    const company = await Company.create(data);

    return res.send({
      status: 200,
      message: "Empresa criada com sucesso",
      data: company,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/RegisterController.js',
    error: dadosDoErro?.message,
    method: 'RegisterController',
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
      mesage: "Falha ao registrar Empresa",
      Error: dadosdoErro,
    });
  }
};
