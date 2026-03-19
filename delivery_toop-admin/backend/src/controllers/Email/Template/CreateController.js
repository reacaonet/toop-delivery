const EmailTemplateModel = require("../../../models/Email/EmailTemplateModel");
const LogModel = require('../../../models/LogModel');

const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { isRoot, isCompany, isFranchise, franchise, franchises } = req;
    const data = req.body;

    data._id = new mongoose.Types.ObjectId().toHexString();

    if (isFranchise) data.franchise = franchise;

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    let record = await EmailTemplateModel.create(data);

    return res.send({
      status: 200,
      message: "Tipo de e-mail criado com sucesso",
      data: record,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Email/Template/CreateController.js',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      message: "Falha ao criar template de email",
      Error: dadosDoErro,
    });
  }
};
