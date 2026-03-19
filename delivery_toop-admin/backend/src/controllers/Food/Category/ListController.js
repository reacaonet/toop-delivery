const Category = require("../../../models/Food/CategoryModel");
const Product = require("../../../models/Food/ProductModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const company = req.params.companyId;
    let isPaused = req.query.isPaused === "true" ? true : false;
    let hideItens = req.query.hideItens === "true" ? true : false;

    let data = {};

    if (company) {
      data.company = company;
    }

    if (isPaused) {
      data.isPaused = { $ne: isPaused };
    }

    data.deletedAt = {
      $exists: false,
    };

    const categories = await Category.find(data).sort({ _id: 1 }).lean();

    let list = [];
    let idsCategories = [];

    if (!categories) {
      return res.status(200).send({});
    }

    idsCategories = categories.map(item => {
      return item._id;
    });

    let products = [];
    if (hideItens === true) {
      products = await getNoItems(idsCategories, isPaused);
    } else {
      products = await getWithItems(idsCategories, isPaused);
    }

    for await (category of categories) {
      list.push({
        products,
        ...category,
      });
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Category/ListController.js',
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
      message: "Falha ao encontrar Categoria",
      Error: dadosDoErro,
    });
  }
};

const getWithItems = async (idsCategories, isPaused) => {
  try {
    return await Product.aggregate([
      {
        $match: {
          category: { $in: idsCategories },
          isPaused: { $ne: isPaused },
        },
      },
      {
        $lookup: {
          from: "foodProductComplement",
          let: { productId: "$_id" },
          as: "complement",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] },
              },
            },
            {
              $match: {
                $expr: { $ne: ["$isPaused", isPaused] },
              },
            },
            {
              $lookup: {
                from: "foodProductComplementItem",
                let: { complementId: "$_id" },
                as: "items",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$foodProductComplement", "$$complementId"],
                      },
                    },
                  },
                  {
                    $match: {
                      $expr: { $ne: ["$isPaused", isPaused] },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        sort: { category: 1 },
      },
    ]);
  } catch (err) {
    return [];
  }
};

const getNoItems = async (idsCategories, isPaused) => {
  try {
    return await Product.aggregate([
      {
        $match: {
          category: { $in: idsCategories },
          isPaused: { $ne: isPaused },
        },
      },
      {
        $lookup: {
          from: "foodProductComplement",
          let: { productId: "$_id" },
          as: "complement",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] },
              },
            },
            {
              $match: {
                $expr: { $ne: ["$isPaused", isPaused] },
              },
            },
          ],
        },
      },
      {
        sort: { category: 1 },
      },
    ]);
  } catch (err) {
    return [];
  }
};
