const Shopper = require("../../models/ShopperModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { person, company } = req.query;
    //const { company, companies = [] } = req;
    let or = [];

    if (person) {
      or.push({
        person: person,
      });
    }

    if (company) {
      or.push({
        company: company,
      });
    }

    if (!or.length) {
      return res.status(400).send({
        message: "Filtro é obrigatório",
      });
    }

    const filter = {};
    // restringe os dados a nivel da franquia

    const list = await Shopper.find({
      ...filter,
      $or: or,
      deletedAt: {
        $exists: false,
      },
    }).lean();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopper/SearchController.js',
    error: dadosDoErro?.message,
    method: 'SearchController',
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
      message: "Falha ao encontrar Shopper",
      Error: dadosDoErro,
    });
  }
};
