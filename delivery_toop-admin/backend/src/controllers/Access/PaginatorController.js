const AccessFlowModel = require("../../models/Access/AccessFlowModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { page, limit } = req.query;

    let list;
    let filter = {};

    if (!page || !limit) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await AccessFlowModel.find(filter)
      .populate("person")
      .populate("customer")
      .limit(parseInt(limit))
      .skip(parseInt(page) * parseInt(limit));
    let numTotal = await AccessFlowModel.find().countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Access/PaginatorController.js',
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
