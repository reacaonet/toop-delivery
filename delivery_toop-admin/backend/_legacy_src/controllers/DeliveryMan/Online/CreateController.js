const DeliveryManOnlineModel = require('../../../models/DeliveryMan/DeliveryManOnlineModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {

    const data = req.body;

    data.online = new Date();
    data.offline = null;

    const deliveryMan = await DeliveryManOnlineModel.create(data);

    return res.send({
      status: 200,
      message: "Entregador Online",
      data: deliveryMan
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/DeliveryMan/Online/CreateController.js',
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
      message: "Falha Entregador Online",
      error: dadosDoErro
    });
  }
};
