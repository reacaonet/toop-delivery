const mongoose = require("mongoose");

const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const UserModel = require("../../models/UserModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { search, user } = req.query;

    let filter = {};

    if (user && mongoose.Types.ObjectId.isValid(user)) {
      const userF = await UserModel.findOne({
        _id: mongoose.Types.ObjectId(user),
      });

      if (Array.isArray(userF.franchises) && userF.franchises.length > 0) {
        userF.franchises = userF.franchises.map(franchiseId => {
          return mongoose.Types.ObjectId(franchiseId);
        });

        filter._id = {
          $in: userF.franchises,
        };
      }
    }

    if (search && typeof search === "string") {
      filter.name = {
        $regex: ".*" + search.toLowerCase() + ".*",
        $options: "i",
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    const list = await FranchiseModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "settingState",
          let: { state: "$state" },
          as: "state",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$state"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "settingCity",
          let: { city: "$city" },
          as: "city",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$city"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$state", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$city", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          name: 1,
          type: 1,
          state: 1,
          city: 1,
        },
      },
    ]);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Franchise/SearchController.js',
    error: dadosDoErro?.message,
    method: 'SearchController',
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
      mesage: "Falha ao encontrar Franquia",
      error: dadosDoErro,
    });
  }
};
