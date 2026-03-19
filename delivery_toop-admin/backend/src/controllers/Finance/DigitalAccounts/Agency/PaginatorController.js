const mongoose = require("mongoose");

const AgencyModel = require("../../../../models/Finance/DigitalAccounts/AgencyModel");
const LogModel = require('../../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name, status } = req.query;
    const { tokenUser, franchise, franchises = [] } = req;

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

    filter = { franchise: { $in: franchise ? [franchise] : franchises } };

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter.deletedAt = { $exists: false };

    const list = await AgencyModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "franchise",
          localField: "franchise",
          foreignField: "_id",
          as: "franchise",
        },
      },
      {
        $lookup: {
          from: "bank",
          localField: "bank",
          foreignField: "_id",
          as: "bank",
        },
      },
      {
        $project: {
          bank: { $arrayElemAt: ["$bank", 0] },
          franchise: { $arrayElemAt: ["$franchise", 0] },
          code: 1,
          name: 1,
          status: 1,
          description: 1,
          deletedAt: 1,
        },
      },
      { $skip: parseInt(pageIn) * parseInt(pageOut) },
      { $limit: parseInt(pageOut) },
    ]);

    let numTotal = await AgencyModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/DigitalAccounts/Agency/PaginatorController.js',
    error: err?.message,
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
