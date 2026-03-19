const mongoose = require('mongoose');

const NotificationModel = require('../../../models/Mobility/Notification/NotificationModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;

    let { type, franchise } = req.query;

    let list = [];
    let filter = {};

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Id inválido' });
    }

    // --> type filter
    if (type) {
      filter.type = type;
    }
    // --> filter franchise
    if (franchise) {
      filter.franchise = franchise;
    }

    if (`${status}` === 'false' || `${status}` === 'true') {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== 'all') {
      filter.status = { $eq: true };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await NotificationModel.find(filter);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Notification/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
      message: 'Falha ao encontrar Registro',
      Error: dadosDoErro.message,
    });
  }
};
