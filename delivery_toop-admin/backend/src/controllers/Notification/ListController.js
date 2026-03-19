const Notification = require('../../models/NotificationModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const list = await Notification.find()
      .populate('company', { name: 1 });

    return res.status(200).send(list);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Notification/ListController.js',
      error: err?.message,
      method: 'Notification/ListController',
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
      mesage: "Falha ao encontrar Notificação",
      error: err.message,
    });
  }
};
