const mongoose = require('mongoose');

const SiteModel = require('../../models/Company/SiteModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    data.status =
      (typeof data.status === "string" && data.status === "") ||
      data.status === null
        ? false
        : data.status;

    let companySite = await SiteModel.create(data);

    companySite = await companySite.populate("company", {name: 1}).execPopulate();

    return res.send({
      status: 200,
      message: "SITE criado com sucesso",
      data: companySite,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/site/CreateController.js',
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
      message: "Falha ao criar SITE",
      Error: dadosDoErro,
    });
  }
};
