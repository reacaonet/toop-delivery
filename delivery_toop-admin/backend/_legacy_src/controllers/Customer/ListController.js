const Customer = require('../../models/CustomerModel');
const LogModel = require('../../models/LogModel');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    let list  = [];
    if (id) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({
          message: "Usuário não encontrado",
          Error: dadosDoErro.message
        });
      }

      list = await Customer.findById(id).populate('person');
    } else {
      list = await Customer.find();
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Customer/ListController.js',
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
      message: "Falha ao encontrar Customer",
      Error: dadosDoErro.message
    });
  }
}
