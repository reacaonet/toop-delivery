const mongoose = require('mongoose');
const Product = require('../../models/ProductModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;
    const { filter } = req.query;

    let list;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      list = await Product.findById(id).populate('company');
    } else if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Id inválido"
      });
    } else {
      let search = {};
      if (filter) {
        search.name = { $regex: '.*' + filter.toLowerCase() + '.*', $options: 'i' };
      }

      search.deletedAt = {
        $exists: false,
      }

      list = await Product.find(search).populate('company');
    }

    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Product/ListController.js',
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


    console.log('Error ', dadosDoErro);
    return res.status(400).send({
      mesage: "Falha ao encontrar Produto",
      error: dadosDoErro.message
    });
  }
};
