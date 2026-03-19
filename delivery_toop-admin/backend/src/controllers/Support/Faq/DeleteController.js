const FaqModel = require('../../../models/Support/FaqModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    await FaqModel.findOneAndRemove({ _id: id });

    res.send({
      status: 200,
      message: "FAQ deletado com sucesso"
    });
  } catch (error) {
    await LogModel.create({
      path: 'src/controllers/Support/Faq/DeleteController.js',
      error: error?.message,
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
      message: "Falha ao deletar FAQ",
      Error: dadosDoErro
    });
  }
};
