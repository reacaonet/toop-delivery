const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Category = require("../../../models/Accessories/CategoryModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // Get company by header
    const company = req.company;
    const { } = req.query;
    //const { company, companies = [] } = req;

    //let filter = {};
    //filter.company = { $in: company ? [ObjectId(company)] : companies };
    if (!company || !ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Falha ao validar a company vinculada ao usuário!",
      });
    }

    let filter = {};
    filter.company = ObjectId(company);

    const categoriesData = await Category.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "accessoriesProduct",
          let: { id: "$_id" },
          as: "products",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$id"] },
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
    ]).catch((error) => {
      console.log("Falha Aggretate", error);
      return res.status(400).send({
        message: "Falha ao encontrar Categoria",
        error: error,
      });
    });

    return res.status(200).json(categoriesData);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Acessories/ByCompanyController.js',
      error: err?.message,
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

    console.log("error ", err.message);
    return res.status(400).send({
      message: "Falha ao encontrar Categoria",
      Error: err.message,
    });
  }
};
