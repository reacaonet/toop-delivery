const Category = require('../../../../models/v1/Food/CategoryModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    await Category.findOneAndRemove({ _id: id });

    res.send({
      status: 200,
      message: "Categoria deletado com sucesso"
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/v1/Food/Category/DeleteController.js',
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
      messsage: "Falha ao deletar Categoria",
      Error: dadosDoErro
    });
  }
};