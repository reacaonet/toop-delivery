const mongoose = require("mongoose");

const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
const LogModel = require('../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;

    const { type, status } = req.query;
    const { tokenUser, company, companies = [], franchise } = req;

    let filter = {};
    if (companies.length || company || franchise) {
      filter = {
        company: {
          $in: companies.length > 0 ? companies : [company],
        },
      };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter._id = id;
    filter.deletedAt = { $exists: false };
    if (type) filter.type = type;

    list = await AccountModel.find(filter);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Account/ListController.js',
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
      message: "Falha ao encontrar Conta Bancária",
      Error: dadosDoErro.message,
    });
  }
};
