const Item = require('../../../../models/Shopping/CartItemModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const _id = req.params.id

    await Item.findOneAndUpdate({ _id: _id }, { isDeleted: true }, { upsert: false, new: true });

    res.send({
      status: 200,
      message: "Item removido do Carrinho com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Cart/Item/DeleteController.js',
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
      messsage: "Falha ao remover Item do Carrinho",
      Error: dadosDoErro
    });
  }
};
