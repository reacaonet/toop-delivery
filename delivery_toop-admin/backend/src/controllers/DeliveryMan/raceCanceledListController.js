const RaceCanceled = require('../../models/DeliveryMan/raceCanceled');
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { order, all } = req.query;
    let list
    let filter = {};

    if (!order) {
      return res.status(400).send({
        mesage: "Falha ao encontrar a corrida cancelada",
        error: dadosDoErro
      });
    }
    filter.order = order;

    if (all == 'true') {
      list = await RaceCanceled.find(filter);
    } else {
      list = await RaceCanceled.findOne(filter);
    }

    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/DeliveryMan/raceCanceledListController.js',
    error: dadosDoErro?.message,
    method: 'raceCanceledListController',
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
      mesage: "Falha ao encontrar a corrida cancelada",
      error: dadosDoErro
    });
  }
};
