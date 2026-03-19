const mongoose = require('mongoose');

const NotificationModel = require('../../../models/Mobility/Notification/NotificationModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    // Trata status
    data.status = true;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }

    const notification = await NotificationModel.create(data);

    return res.send({
      status: 200,
      message: 'Registro adicionado com sucesso',
      data: notification,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Notification/CreateController.js',
    error: dadosDoErro?.message,
    method: 'CreateController',
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
      message: 'Falha ao criar Registro',
      Error: dadosDoErro,
    });
  }
};

const existEmail = async email => {
  let isEmail = await FranchiseModel.findOne({ email }).lean();
  if (isEmail) {
    return true;
  }
  return false;
};
