const mongoose = require("mongoose");
const ProductComplement = require("../../../models/Food/ProductComplementModel");
const ProductComplementItem = require("../../../models/Food/ProductComplementItemModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    let listComplementItem = [];
    let filter = {};
    let filterComplements = {};
    let isPaused = req.query.isPaused ? true : "";
    const productId = req.params.productId;

    filter.product = mongoose.Types.ObjectId(productId);

    if (isPaused) {
      filter.isPaused = { $ne: isPaused };
      filterComplements = { $expr: { $ne: ["$isPaused", isPaused] } };
    }

    filter.deletedAt = {
      $exists: false,
    };

    // const lists = await ProductComplement.find(filter);

    // for await (list of lists) {
    //     const products = await ProductComplementItem.find({ foodProductComplement: list._id }).lean();
    //     listComplementItem.push({
    //         complement: list,
    //         products
    //     });
    // }
    // return res.json(listComplementItem)

    let response = await ProductComplement.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "foodProductComplementItem",
          let: { complementId: "$_id" },
          as: "products",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$foodProductComplement", "$$complementId"] },
              },
            },
            {
              $match: filterComplements,
            },
          ],
        },
      },
    ]);

    // para manter o padrão da consulta anterior
    for await (list of response) {
      let products = list.products;
      delete list.products;

      listComplementItem.push({
        complement: list,
        products,
      });
    }

    return res.json(listComplementItem);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/ProductComplement/ListController.js',
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
      message: "Falha ao encontrar Complemento",
      Error: dadosDoErro,
    });
  }
};
