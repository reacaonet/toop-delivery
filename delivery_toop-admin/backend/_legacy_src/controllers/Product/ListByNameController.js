const ProductModel = require('../../models/ProductModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { listByName, company } = req.query;
    const filter = {};

    if (listByName && (typeof listByName === 'string')) {
      filter.name = { $regex: '.*' + listByName.toLowerCase() + '.*', $options: 'i' };
    } else {
      return res.json([]);
    }

    if (company) {
      filter.company = company;
    }

    filter.deletedAt = {
      $exists: false,
    }

    const list = await ProductModel.find(filter, { name: 1 });
    return res.json(list);

  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Product/ListByNameController.js',
    error: dadosDoErro?.message,
    method: 'ListByNameController',
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
      mesage: "Falha ao encontrar Produto",
      error: dadosDoErro
    });
  }
};
