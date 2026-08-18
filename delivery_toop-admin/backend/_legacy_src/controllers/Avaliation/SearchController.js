const Avaliation = require("../../models/AvaliationModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { order } = req.query;

    let or = [];

    if (order) {
      or.push({
        order: order,
      });
    }

    if (!or.length) {
      return res.status(400).send({
        message: "Filtro é obrigatório",
      });
    }

    const list = await Avaliation.find({
      $or: or,
    }).lean();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Avaliation/SearchController.js',
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
      message: "Falha ao encontrar avaliações",
      Error: dadosDoErro,
    });
  }
};
