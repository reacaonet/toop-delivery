const mongoose = require("mongoose");

const User = require("../../models/UserModel");
const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");
const Shopper = require("../../models/ShopperModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    let list = {};
    const id = req.params.id;
    const { type } = req.query;
    const { tokenUser, company, companies } = req;

    let filter = {};
    if ((companies && companies.length) || company) {
      filter = {
        company: {
          $in: companies.length > 0 ? companies : [company],
        },
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (id && mongoose.isValidObjectId(id)) {
      filter._id = id;
      list = await listOne(id, type);
    } else {
      list = await User.find(filter)
        .populate("person")
        .populate("company")
        .populate({
          path: "franchises",
          match: {
            status: { $eq: true },
            deletedAt: {
              $exists: false,
            },
          },
          select: "name",
        });
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/User/ListController.js',
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


    console.log("Falhou", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao encontrar User",
      Error: dadosDoErro,
    });
  }
};

const listOne = async (id, type) => {
  let matchFilter = {
    _id: mongoose.Types.ObjectId(id),
  };

  let user = {};

  if (type === "shopper") {
    let response = await Shopper.findById(id).lean();
    if (response && response._id) {
      let userResponse = await User.findOne({ person: response.person }).lean();

      userResponse.shopper = response;
      return userResponse;
    }

    user = {
      from: "shopper",
      as: "shopper",
      let: { personId: "$person" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$person", "$$personId"] },
          },
        },
        {
          $limit: 1,
        },
      ],
    };
  } else if (type === "deliveryMan") {
    let response = await DeliveryMan.findById(id).lean();
    if (response && response._id) {
      let userResponse = await User.findOne({ person: response.person }).lean();

      userResponse.deliveryMan = response;
      return userResponse;
    }

    user = {
      from: "deliveryMan",
      as: "deliveryMan",
      let: { personId: "$person" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$person", "$$personId"] },
          },
        },
        { $limit: 1 },
      ],
    };
  }

  let result = await User.aggregate([
    { $match: matchFilter },
    { $lookup: user },
    { $unwind: { path: "$shopper", preserveNullAndEmptyArrays: true } },
    { $limit: 1 },
  ]);

  if (result && result.length > 0) {
    return result[0];
  }

  return null;
};
