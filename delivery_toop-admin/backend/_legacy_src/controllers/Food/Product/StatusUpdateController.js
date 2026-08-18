const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const ProductModel = require('../../../models/Food/ProductModel');
const ProductComplementModel = require('../../../models/Food/ProductComplementModel');
const ProductComplementItemModel = require('../../../models/Food/ProductComplementItemModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Trata status
    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    const product = await ProductModel.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: false,
      new: true
    });

    return res.send({
      status: 200,
      message: "Registro atualizado com sucesso",
      data: product,
    });

  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Product/StatusUpdateController.js',
    error: dadosDoErro?.message,
    method: 'StatusUpdateController',
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
      message: "Falha ao atualizar Produto",
      Error: dadosDoErro
    });
  }
};
