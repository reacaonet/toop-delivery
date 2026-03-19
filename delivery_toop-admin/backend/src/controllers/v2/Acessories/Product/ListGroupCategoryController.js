const mongoose = require('mongoose');
const Category = require('../../../../models/Accessories/CategoryModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { company } = req.query;
    const appVersion = req.header('appVersion');

    if (!company || (company && !mongoose.Types.ObjectId.isValid(company))) {
      return res.status(400).send({
        message: 'Company inválida'
      })
    }

    const result = await Category.aggregate([
      { $match: { company: mongoose.Types.ObjectId(company), isPaused: { $ne: true } } },
      {
        $sort: { _id: 1 }
      },
      {
        $lookup: {
          from: "accessoriesProduct",
          let: { id: "$_id", },
          as: "products",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$id"] }
              }
            },
          ],
        },
      },
    ])



    const filter = result.filter(p => p.products.length > 0).map(p => {
      // nesta regra somente o atual vai enviar a versão
      if (appVersion) {
        return {
          title: p.name,
          key: p._id,
          data: p.products,
        };
      } else {
        return {
          title: p.name,
          key: p._id,
          products: p.products // Compatibilidade versao 1.5.9
        };
      }
    });

    return res.json(filter);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Acessories/Product/ListGroupCategoryController.js',
      error: err?.message,
      method: 'ListGroupCategoryController',
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

    console.log('err', err);
    return res.status(400).send({
      message: "Falha ao encontrar Produto",
      Error: dadosDoErro
    });
  }
};
