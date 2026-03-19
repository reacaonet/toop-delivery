const mongoose = require('mongoose');
const RaceCanceled = require('../../models/DeliveryMan/raceCanceled');
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {

    const data = req.body;

    if (!data.order) {
      return res.status(400).send({
        message: 'Informe o id da order que foi cancelada'
      });
    }

    if (!data.deliveryMan) {
      return res.status(400).send({
        message: 'Informe o id do entregador'
      });
    }

    if (!data.date) {
      return res.status(400).send({
        message: 'Informe a data do cancelamento'
      });
    }

    const raceCanceled = await RaceCanceled.create(data);

    return res.send({
      status: 200,
      message: "Cancelamento de entrega registrado",
      data: raceCanceled
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/DeliveryMan/raceCanceledController.js',
    error: dadosDoErro?.message,
    method: 'raceCanceledController',
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
      message: "Falha ao tentar registrar o cancelamento da entrega",
      error: dadosDoErro
    });
  }
};
