const mongoose = require('mongoose');

const Item = require('../../../../models/Shopping/CartItemModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {

    const foodId = req.params.foodId;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).send({
        message: 'ID do carrinho inválido'
      })
    }

    let list = await Item.find({ foodProduct: foodId });

    return res.json(list)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Cart/food/ListController.js',
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
      message: "Falha ao listar Itens",
      Error: dadosDoErro
    });
  }
};
