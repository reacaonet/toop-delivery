const mongoose = require('mongoose');

const PaymentMethod = require('../../../models/Shopping/PaymentMethodModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: 'Id do registro inválido',
      })
    }

    await PaymentMethod.findOneAndUpdate({ _id: id }, {
      isDeleted: true
    });

    res.send({
      status: 200,
      message: "Pagamento excluído com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/PaymentMethod/DeleteController.js',
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
      messsage: "Falha ao excluir pagamento",
      Error: dadosDoErro
    });
  }
};
