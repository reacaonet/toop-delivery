const FaqModel = require('../../../models/Support/FaqModel');
const LogModel = require("../../../models/LogModel");

const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    let faq = await FaqModel.create(data);

    return res.send({
      status: 200,
      message: "FAQ criado com sucesso",
      data: faq
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Support/Faq/CreateController.js',
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
      message: "Falha ao criar FAQ",
      Error: dadosDoErro
    });
  }
};