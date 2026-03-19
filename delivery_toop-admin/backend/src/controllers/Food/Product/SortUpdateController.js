const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const ProductModel = require('../../../models/Food/ProductModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (data && Array.isArray(data)) {
      for await (const product of data) {
        if (product._id && ObjectId.isValid(product._id) && typeof product.position === 'number') {
          const prod = await ProductModel.findOneAndUpdate({
            _id: product._id
          }, {
            $set: {
              position: product.position
            }
          }, {
            upsert: false,
            new: true
          }).catch(err => {
            return res.status(400).send({
              message: "Falha ao atualizar o produto",
              Error: product
            });
          });
        }
      }
    }

    return res.send({
      status: 200,
      message: "Registros atualizados com sucesso",
      data: {},
    });

  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Product/SortUpdateController.js',
    error: dadosDoErro?.message,
    method: 'SortUpdateController',
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
