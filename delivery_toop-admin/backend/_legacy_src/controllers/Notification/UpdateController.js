const Notification = require('../../models/NotificationModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const novoRegistro = await Notification
      .findOneAndUpdate({
        _id: id
      }, data, {
        upsert: true,
        new: true
      })
      .populate('company', {name: 1});

    res.send({
      status: 200,
      message: "Notificação atualizada com sucesso",
      data: novoRegistro
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Notification/UpdateController.js',
    error: dadosDoErro?.message,
    method: 'UpdateController',
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
      message: "Falha ao atualizar Notificação",
      Error: dadosDoErro
    });
  }
};
