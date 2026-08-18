const mongoose = require("mongoose");

/** Model */
const Category = require("../../../models/Application/CategoryModel");
const SegmentModel = require("../../../models/Company/SegmentModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const getFranchise = require("../../../services/franchise");

module.exports = async (req, res) => {
  try {
    const { type, showHome, latitude, longitude, segment, companyCategory } = req.query;

    let filter = {};
    let filterSegment = {};

    const filterFranchise = {};

    filter.deletedAt = {
      $exists: false,
    };

    // if (type) {
    //   filter.type = {
    //     $eq: type,
    //   };
    // }

    if (companyCategory && companyCategory === "delivery") {
      filterSegment.category = { $ne: "service" };
    } else if (companyCategory) {
      filterSegment.category = companyCategory;
    }

    filter.showInApp = {
      $eq: true,
    };

    if (segment && mongoose.isValidObjectId(segment)) {
      filter.segment = mongoose.Types.ObjectId(segment);
    }

    if (`${showHome}` === "true" || `${showHome}` === "false") {
      filter.showHome = `${showHome}` === "true" ? true : false;
    }

    if (latitude && longitude) {
      const franchiseId = await getFranchise(latitude, longitude);

      if (franchiseId) {
        filterFranchise["segment.franchise"] = franchiseId;
      }
    }

    const list = await Category.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "companySegment",
          let: { segmentId: "$segment" },
          as: "segment",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$segmentId"] },
                ...filterSegment,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$segment", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filterFranchise,
      },
      {
        $match: {
          segment: { $exists: true },
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
    ]);

    return res.json(list);
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Aplicativos/Category/ListController.js',
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
      message: "Falha ao encontrar categoria",
      Error: err.message,
    });
  }
};
