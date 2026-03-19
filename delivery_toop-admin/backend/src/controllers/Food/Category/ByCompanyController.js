const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Category = require("../../../models/Food/CategoryModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    // Get company by header
    const company = req.company;
    //const { company, companies = [] } = req;
    const { term } = req.query;

    if (!company || !ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Falha ao validar a company vinculada ao usuário!",
      });
    }

    let filter = {};
    filter.deletedAt = {
      $exists: false,
    };

    //filter = { company: { $in: company ? [ObjectId(company)] : companies } };
    filter.company = ObjectId(company);

    if (term && typeof term === "string" && term.trim().length > 0) {
      filter.name = { $regex: ".*" + term.toLowerCase() + ".*", $options: "i" };
    }

    const categoriesData = await Category.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "foodProduct",
          let: { id: "$_id" },
          as: "products",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$id"] },
                deletedAt: {
                  $exists: false,
                },
              },
            },
            {
              $sort: { position: 1 },
            },
          ],
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "products.createdAt": 0,
          "products.updatedAt": 0,
          "products.__v": 0,
        },
      },
    ]).catch(error => {
      return res.status(400).send({
        message: "Falha ao encontrar Categoria",
        error: error,
      });
    });

    return res.status(200).json(categoriesData);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Category/ByCompanyController.js',
    error: dadosDoErro?.message,
    method: 'ByCompanyController',
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
      message: "Falha ao encontrar Categoria",
      Error: dadosDoErro,
    });
  }
};
