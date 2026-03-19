const mongoose = require("mongoose");
const Cart = require("../../../models/Shopping/CartModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const customer = req.params.customer;
    const company = req.params.company;
    let data = req.body;

    data._id = new mongoose.Types.ObjectId().toHexString();

    let cartFind = await Cart.findOne({
      customer,
      company,
      status: {
        $in: ["pending", "inProgress"],
      },
    }).sort({ createdAt: -1 });

    if (cartFind && cartFind.status === "inProgress") {
      return res.status(400).send({
        error: "Já existe uma compra em andamento para esse cliente neste estabelecimento!",
      });
    }

    if (cartFind && cartFind.status === "pending") {
      return res.send({
        status: 200,
        message: "Carrinho já foi criado anteriormente",
        data: cartFind,
      });
    }

    data = {
      customer,
      company,
      ...data,
    };

    const cart = await Cart.create(data);
    const cartData = await cart.populate("cart").execPopulate();

    return res.send({
      status: 200,
      message: "Carrinho de Compras criado com sucesso",
      data: cartData,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopper/UpdateController.js',
    error: dadosDoErro?.message,
    method: 'UpdateController',
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
      message: "Falha ao criar Carrinho de Compras",
      Error: dadosDoErro,
    });
  }
};
