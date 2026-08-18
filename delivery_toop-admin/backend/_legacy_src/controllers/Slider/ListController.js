/** Lib */
const mongoose = require("mongoose");
const CompanyModel = require("../../models/Company/CompanyModel");
const LogModel = require("../../models/LogModel");

/* Model */
const Slider = require("../../models/SliderModel");

/** Service */
const getFranchise = require("../../services/franchise");

module.exports = async (req, res) => {
  try {
    const { company, limit, latitude, longitude, type, segment, category } = req.query;
    //const { company, companies = [] } = req;

    let limitSlider = 50;
    const filter = {};
    const filterFranchise = {};

    const appVersion = req.header("appVersion");

    if (limit && limit > 0) {
      limitSlider = limit;
    }

    if (company && mongoose.isValidObjectId(company)) {
      filter.company = company;
    }

    // todos valores que não são iguais ao banner
    filter.type = { $ne: "banner" };

    if (type) {
      filter.type = { $eq: `${type}` };
    }

    if (segment) {
      filter.segment = mongoose.Types.ObjectId(segment);
    } else {
      filter.$or = [{ segment: { $exists: false } }, { segment: { $eq: null } }];
      filter.segment = { $exists: false };
    }

    if (category && typeof category === "string") {
      if (category === "delivery") {
        filter.category = {
          $ne: "service",
        };
      } else {
        filter.category = `${category}`.toLocaleLowerCase().trim();
      }
    }

    const franchiseId = await getFranchise(latitude, longitude);

    if (!franchiseId)
      return res.status(200).send([]);

    filterFranchise["company.franchise"] = franchiseId;
    filter.status = true;
    filter.deletedAt = { $exists: false };

    // restringe os dados a nivel da franquia

    let list = [];

    if (type && type === "banner") {
      list = await getBanner(filter, limitSlider);
    } else {
      list = await getSlider(filter, limitSlider, filterFranchise);
    }

    return res.status(200).send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Slider/ListController.js',
      error: err?.message,
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

    return res.status(400).send({
      message: "Falha ao encontrar Slider",
      Error: err.message,
    });
  }
};

const getSlider = async (filter, limitSlider, filterFranchise = {}) => {
  let list = await Slider.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "company",
        let: { company: "$company" },
        as: "company",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$company"] },
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
    { $match: filterFranchise },
    { $limit: limitSlider },
  ]);

  list = list.map(item => {
    if (item.foodId) {
      item.productId = item.foodId;
    }

    return item;
  });

  return list;
};

const getBanner = async (filter, limitSlider) => {
  let list = await Slider.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "company",
        let: { company: "$company" },
        as: "company",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$company"] },
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "product",
        let: { product: "$productId" },
        as: "product",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$product"] },
            },
          },
          {
            $project: {
              name: 1,
              images: 1,
              price: 1,
              pricePromotion: 1,
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "foodProduct",
        let: { food: "$foodId" },
        as: "foodProduct",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$food"] },
            },
          },
          {
            $project: {
              name: 1,
              images: 1,
              price: 1,
              pricePromotion: 1,
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $unwind: { path: "$foodProduct", preserveNullAndEmptyArrays: true } },
    { $limit: limitSlider },
  ]);

  list = list.map(item => {
    if (item.foodProduct && item.foodProduct._id) {
      item.productId = item.foodProduct._id;
      item.product = item.foodProduct;
    }

    return item;
  });

  return list;
};
