const NotificationModel = require('../../../models/Mobility/Notification/NotificationModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    const search = req.query.search;

    if (search && typeof search === 'string') {
      list = await NotificationModel.find(
        {
          description: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' },
          deletedAt: { $exists: false },
        },
        { description: 1, type: 1 },
      );
      return res.json(list);
    } else {
      return res.json([]);
    }
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Notification/SearchController.js',
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
      mesage: 'Falha ao encontrar Registros',
      error: dadosDoErro,
    });
  }
};
