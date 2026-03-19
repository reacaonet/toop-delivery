const Cart = require('../../../models/Shopping/CartModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
    try {
        const id = req.params.id

        // Atualiza status para
        await Cart.findOneAndUpdate({ _id: id }, {
            isDeleted: true,
            status: 'deleted',
        }, { upsert: true, new: true });

        res.send({
            status: 200,
            message: "Carrinho de Compras deletado com sucesso"
        });
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Cart/DeleteController.js',
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
            messsage: "Falha ao deletar Carrinho de Compras",
            Error: dadosDoErro
        });
    }
};