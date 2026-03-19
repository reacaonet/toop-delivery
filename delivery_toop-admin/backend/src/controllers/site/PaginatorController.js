const SiteModel = require("../../models/Company/SiteModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { company, companies = [] } = req;

    let filter = {};
    let list;

    if (!page || !limit) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    filter.deletedAt = {
      $exists: false,
    };
    // restringe os dados a nivel da franquia
    filter.company = { $in: companies.length > 0 ? companies : [company] };

    list = await SiteModel.find(filter)
      .populate("company")
      .limit(parseInt(limit))
      .skip(parseInt(page) * parseInt(limit));
    let numTotal = await SiteModel.find().countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/site/PaginatorController.js',
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
