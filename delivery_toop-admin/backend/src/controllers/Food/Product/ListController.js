const Product = require("../../../models/Food/ProductModel");
const Category = require("../../../models/Food/CategoryModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { filter, company } = req.query;
    let isPaused = req.query.isPaused ? true : "";
    let search = {};
    let filterCategory = {};

    search.deletedAt = {
      $exists: false,
    };

    filterCategory.deletedAt = {
      $exists: false,
    };

    if (company) {
      filterCategory.company = company;
      if (isPaused) {
        search.isPaused = { $ne: isPaused };
        filterCategory.isPaused = { $ne: isPaused };
      }

      if (filter) {
        search.$text = { $search: filter };
      }

      let ids = [];
      const categories = await Category.find(filterCategory).sort({ _id: 1 }).select({ _id: 1 }).lean();

      if (categories && categories.length > 0) {
        categories.map(item => {
          ids.push(item._id);
        });
      }

      search.category = { $in: ids };
    }

    const list = await Product.find(search).sort({ category: 1 }).populate("category").lean();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Product/ListController.js',
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


    console.log("Error", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao encontrar Produto",
      Error: dadosDoErro,
    });
  }
};
