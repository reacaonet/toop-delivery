const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
const LogModel = require('../../../../models/LogModel');
const mongoose = require("mongoose");

const search = async (req, res) => {
  try {
    const { agency } = req.query;
    let or = [];

    if (agency && mongoose.isValidObjectId(agency)) {
      or.push({
        agency: agency,
      });
    }

    const list = await AccountModel.find({
      $or: or,
    })
      .populate("holder")
      .lean();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Account/SearchController.js',
    error: dadosDoErro?.message,
    method: 'search',
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


    console.log("dadosDoErro", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao encontrar Account",
      Error: dadosDoErro.message,
    });
  }
};

module.exports = search;
