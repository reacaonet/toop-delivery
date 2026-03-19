const mongoose = require("mongoose");
const EmailTemplateModel = require("../../../models/Email/EmailTemplateModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { isRoot, isCompany, isFranchise, franchise, franchises } = req;
    const { pageIn, pageOut } = req.query;
    const filter = {};

    if (isFranchise) filter.franchise = mongoose.Types.ObjectId(franchise);

    filter.deletedAt = {
      $exists: false,
    };

    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    list = await EmailTemplateModel.find(filter)
      .populate("type")
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));
    let numTotal = await EmailTemplateModel.find().countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Email/Template/PaginatorController.js',
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


    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};
