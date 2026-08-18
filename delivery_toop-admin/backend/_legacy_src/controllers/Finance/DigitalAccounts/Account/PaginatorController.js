const mongoose = require("mongoose");

const AccountModel = require("../../../../models/Finance/DigitalAccounts/AccountModel");
const AgencyModel = require("../../../../models/Finance/DigitalAccounts/AgencyModel");
const LogModel = require('../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name, type, status } = req.query;
    const { tokenUser, company, companies, franchise, franchises = [] } = req;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    let filter = {};

    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    if ((franchises && franchises.length) || franchise) {
      const agency = await AgencyModel.find({
        franchise: { $in: franchise ? [franchise] : franchises },
      });
      filter = {
        agency: {
          $in: agency.map((i) => i._id),
        },
      };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    if (type) filter.type = type;

    filter.deletedAt = { $exists: false };

    const list = await AccountModel.find(filter)
      .populate("agency")
      .populate("bank")
      .populate("holder")
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .limit(parseInt(pageOut));

    let numTotal = await AccountModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Account/PaginatorController.js',
    error: dadosDoErro?.message,
    method: 'PaginatorController',
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
      message: "Falha ao encontrar registros para Paginação",
      Error: dadosDoErro,
    });
  }
};
