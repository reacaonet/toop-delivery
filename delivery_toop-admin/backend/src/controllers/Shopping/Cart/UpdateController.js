const Cart = require("../../../models/Shopping/CartModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // console.log("UpdateCart", data);

    const cart = await Cart.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: false,
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "Carrinho atualizado com sucesso",
      data: cart,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/UpdateController.js',
      error: err?.message,
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
      message: "Falha ao atualizar Carrinho",
      err: err.message,
    });
  }
};
