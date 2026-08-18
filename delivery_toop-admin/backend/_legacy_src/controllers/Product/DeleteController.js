const Product = require('../../models/ProductModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
    try {
        const id = req.params.id

        await Product.findOneAndRemove({ _id: id });

        res.send({
            status: 200,
            message: "Produto deletada com sucesso"
        });
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Product/DeleteController.js',
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
            message: "Falha ao deletar Produto",
            Error: dadosDoErro
        });
    }
};