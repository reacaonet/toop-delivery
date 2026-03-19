const DeliveryAddress = require("../../../models/Customer/DeliveryAddressModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    let list;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      list = await DeliveryAddress.find({ customer: id, isDeleted: false });
    } else if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    } else {
      list = await DeliveryAddress.find();
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Customer/DeliveryAddress/ListController.js',
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
      message: "Falha ao encontrar Endereço de Entrega",
      Error: dadosDoErro,
    });
  }
};
