const ProductComplementItem = require('../../../models/Food/ProductComplementItemModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
    try {
        const filter = {}
        filter.deletedAt = {
            $exists: false,
        }
        const list = await ProductComplementItem.find(filter);

        return res.json(list)
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/ProductComplementItem/ListController.js',
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
            message: "Falha ao encontrar Item",
            Error: dadosDoErro
        });
    }
};