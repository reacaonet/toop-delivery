const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { person, franchise } = req.query;
    let or = [];

    if (person) {
      or.push({
        person: person,
      });
    }

    if (franchise) {
      or.push({
        franchise: franchise,
      });
    }

    if (!or.length) {
      return res.status(400).send({
        message: "Filtro é obrigatório",
      });
    }

    const list = await PassengerModel.find({
      $or: or,
      deletedAt: {
        $exists: false,
      },
    }).lean();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Passenger/SearchController.js',
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
      message: "Falha ao encontrar Passageiro(a)",
      Error: dadosDoErro,
    });
  }
};
