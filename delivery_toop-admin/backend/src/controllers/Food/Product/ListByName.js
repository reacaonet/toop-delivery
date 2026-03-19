const CategoryModel = require('../../../models/Food/CategoryModel');
const ProductModel = require('../../../models/Food/ProductModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const {listByName, company} = req.query;

    const filter = {};
    let categoriesId = [];

    filter.deletedAt = {
      $exists: false,
    };

    if (listByName && (typeof listByName === 'string')) {
      filter.name = { $regex: '.*' + listByName.toLowerCase() + '.*', $options: 'i' };
    }

    if (company) {
      categoriesId = await CategoryModel.find({company}, {_id: 1});
      if (categoriesId.length > 0) {
        filter.category = {
          $in: categoriesId
        };
      }
    }

    const list = await ProductModel.find(filter, { name: 1 });

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Product/ListByName.js',
    error: dadosDoErro?.message,
    method: 'ListByName',
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