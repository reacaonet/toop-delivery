const mongoose = require("mongoose");

const CostCenterModel = require("../../../models/Finance/CostCenterModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, name, status } = req.query;
    const { isRoot, isCompany, isFranchise, franchise, franchises = [] } = req;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    let filter = {
      franchise: { $in: franchises },
    };

    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter.deletedAt = { $exists: false };

    const list = await CostCenterModel.aggregate([{ $match: filter }, { $skip: parseInt(pageIn) * parseInt(pageOut) }, { $limit: parseInt(pageOut) }]);

    let numTotal = await CostCenterModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Finance/CostCenter/PaginatorController.js',
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
