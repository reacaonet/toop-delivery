const moment = require("moment");
const Coupon = require("../../models/Coupon/CouponModel");
const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const CouponCustomer = require("../../models/Coupon/CouponCustomerModel");
const getFranchise = require("../../services/franchise");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const { status, dateInit, dateFinish, person, latitude, longitude } = req.query;

    let filter = {};
    let couponsCustomerId = [];

    if (latitude && longitude) {
      filter.franchise = await getFranchise(latitude, longitude);
    } else {
      filter.franchise = null;
    }

    if (person) {
      const couponsCustomer = await CouponCustomer.find({ person });
      if (couponsCustomer) {
        couponsCustomerId = couponsCustomer.map(item => {
          return item.coupon;
        });
      }
    }

    const couponCompanies = await CouponCompany.find({ companies: { $in: id } })
      .select({ coupon: 1 })
      .lean();

    // if (!couponCompanies) {
    //   return res.json([]);
    // }

    let couponIds = couponCompanies.map(item => {
      return item.coupon;
    });

    filter.status = Boolean(status);

    if (couponsCustomerId && couponIds) {
      filter.$or = [
        { allCompanies: true },
        {
          _id: {
            $nin: couponsCustomerId,
            $in: couponIds,
          },
        },
      ];
      // filter._id = {
      //   $nin: couponsCustomerId,
      //   $in: couponIds,
      // };
    }

    if (couponsCustomerId && !couponIds) {
      filter._id = {
        $nin: couponsCustomerId,
      };
    }

    if (!couponsCustomerId && couponIds) {
      filter._id = {
        $in: couponIds,
      };
    }

    if (dateInit && dateFinish) {
      filter.dateInit = {
        $lte: new Date(moment(dateInit).startOf().format("YYYY-MM-DD")),
      };
      filter.dateFinish = {
        $gte: new Date(moment(dateFinish).endOf().format("YYYY-MM-DD")),
      };
    } else {
      filter.dateInit = {
        $lte: new Date(moment().add().startOf().format("YYYY-MM-DD")),
      };
      filter.dateFinish = {
        $gte: new Date(moment().endOf().format("YYYY-MM-DD")),
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    const list = await Coupon.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "company_coupon",
          let: { couponId: "$_id" },
          as: "couponCompany",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$coupon", "$$couponId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "coupon_customer",
          let: { couponId: "$_id" },
          as: "couponCustomer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$coupon", "$$couponId"] },
              },
            },
            {
              $count: "numberOfTimesUsed",
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$couponCompany" } },
    ]);

    return res.status(200).send(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/CompanyCouponsController.js',
    error: dadosDoErro?.message,
    method: 'CompanyCouponsController',
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
      mesage: "Falha Companhias para esse Cupom",
      error: dadosDoErro,
    });
  }
};
