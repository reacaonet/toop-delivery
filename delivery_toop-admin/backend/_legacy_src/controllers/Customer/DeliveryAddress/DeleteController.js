const DeliveryAddress = require('../../../models/Customer/DeliveryAddressModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    await DeliveryAddress.findOneAndUpdate({ _id: id }, { isDeleted: true }, { upsert: false, new: true });

    res.send({
      status: 200,
      message: "Endereço de entrega deletada com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Customer/DeliveryAddress/DeleteController.js',
    error: dadosDoErro?.message,
    method: 'DeleteController',
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
      message: "Falha ao deletar Endereço de Entrega",
      error: dadosDoErro
    });
  }
};
