const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const ProductComplement = require('../../../../models/Accessories/ProductComplementModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!productId || !ObjectId.isValid(productId)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    }

    const compl = await ProductComplement.aggregate([
      {
        $match: {
          product: ObjectId(productId)
        }
      }, {
        $lookup: {
          from: 'accessoriesProductComplementItem',
          localField: '_id',
          foreignField: 'accessoriesProductComplement',
          as: 'items',
        }
      }
    ]);

    return res.status(200).json(compl)
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Acessories/ProductComplement/ListController.js',
      error: err?.message,
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
      message: "Falha ao encontrar Complemento",
      err: err.message,
    });
  }
};
