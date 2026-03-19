const mongoose = require("mongoose");
const Company = require("../../models/Company/CompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { favoriteCompanies } = req.query;
    let filter = {};

    filter.deletedAt = {
      $exists: false,
    };

    if (!favoriteCompanies) {
      return res.status(400).send({ message: "Favorite companies not informed" });
    }

    const favorites = favoriteCompanies.split(",");
    const favoritesFilter = favorites.map(f => mongoose.Types.ObjectId(f));

    filter._id = { $in: favoritesFilter };

    const list = await Company.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "group",
          let: { groupId: "$groups" },
          as: "groups",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$groupId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "company_delivery",
          let: { deliveryId: "$companyDelivery" },
          as: "companyDelivery",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$deliveryId"] },
                deletedAt: {
                  $exists: false,
                },
              },
            },
            { $limit: 1 },
          ],
        },
      },
    ]);

    let numTotal = await Company.find(filter).countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/ListFavoriteCompanies.js',
    error: dadosDoErro?.message,
    method: 'ListFavoriteCompanies',
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
      message: "Falha ao encontrar empresas favoritas",
      Error: dadosDoErro,
    });
  }
};
