const CampaignModel = require('../../../models/Marketing/CampaignModel');
const LogModel = require("../../../models/LogModel");

const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    // if (!data.file || (typeof data.file !== 'object')) {
    //   return res.status(400).send({
    //     message: 'Imagens inválidas'
    //   });
    // }

    // data.image = [];
    // if (Array.isArray(data.file)) {
    //   data.file.forEach(item => data.image.push(item.url));
    // } else if (data.url) {
    //   data.image.push(data.url)
    // }

    let campaign = await CampaignModel.create(data);

    return res.send({
      status: 200,
      message: "Campanha criado com sucesso",
      data: campaign
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/marketing/Campaign/CreateController.js',
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
      message: "Falha ao criar campanha",
      Error: dadosDoErro
    });
  }
};