const mongoose = require("mongoose");

const CashbackCampaignModel = require("../../../models/Cashback/CashbackCampaignModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;
    const { isRoot, isCompany, isFranchise, franchise, franchises = [] } = req;

    const { status } = req.query;

    let filter = {
      franchise: { $in: franchises },
    };

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    if (id) filter._id = id;
    filter.deletedAt = { $exists: false };

    list = await CashbackCampaignModel.find(filter);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Cashback/Campaign/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
      message: "Falha ao encontrar Campanha",
      Error: dadosDoErro.message,
    });
  }
};
