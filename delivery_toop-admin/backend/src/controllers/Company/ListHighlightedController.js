const mongoose = require("mongoose");
const Company = require("../../models/Company/CompanyModel");
const getFranchise = require("../../services/franchise");
const LogModel = require("../../models/LogModel");

// const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
// const distanceKM = require("../../utils/distanceCoordinate");
// const maxMiles = process.env.maxMiles;

module.exports = async (req, res) => {
  try {
    let { latitude, longitude, category } = req.query;

    let list = [];
    let filter = {};
    let geoNear = null;
    let filterCount = filter;

    filter.isHighlighted = true;

    if (latitude && longitude) {
      const idFranchise = await getFranchise(latitude, longitude);
      filter.franchise = mongoose.Types.ObjectId(idFranchise);
    }

    if (category && typeof category === "string") {
      if (category === "delivery") {
        filter.companyCategory = {
          $ne: "service",
        };
      } else {
        filter.companyCategory = `${category}`.toLocaleLowerCase().trim();
      }
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await getDelivery(list, filter, geoNear);

    return res.json(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/ListHighlightedController.js',
      error: err?.message,
      method: 'ListHighlightedController',
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

    // console.log(err);
    return res.status(400).send({
      message: "Falha ao encontrar Empresas em destaque",
      err: err.message,
    });
  }
};

/**
 * Retonar dados de Entrega
 */
const getDelivery = async (list, filter, geoNear) => {
  try {
    let pushAggregate = [];

    if (geoNear) {
      pushAggregate.push(geoNear);
    }

    pushAggregate.push({ $match: filter });

    pushAggregate.push({
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
    });

    pushAggregate.push({
      $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true },
    });

    pushAggregate.push(
      { $sample: { size: 100 } },
      // {
      //   $project: {
      //     _id: 1,
      //     name: 1,
      //     type: 1,
      //     segment: 1,
      //     shoppingFlow: 1,
      //     images: 1,
      //   },
      // }
    );

    list = await Company.aggregate(pushAggregate);

    return list;
  } catch (err) {
    return list;
  }
};
