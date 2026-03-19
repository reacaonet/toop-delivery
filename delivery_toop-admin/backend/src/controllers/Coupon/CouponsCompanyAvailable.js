const moment = require("moment");
const Customer = require("../../models/CustomerModel");
const Coupon = require("../../models/Coupon/CouponModel");
const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const CouponCustomer = require("../../models/Coupon/CouponCustomerModel");
const OrderStatus = require("../../models/Shopping/order/orderStatusModel");
const getFranchise = require("../../services/franchise");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { subTotal, person, latitude, longitude } = req.query;
    let filter = {};
    let couponsCustomerId = [];

    if (latitude && longitude) {
      filter.franchise = await getFranchise(latitude, longitude);
    } else {
      return res.json([]);
    }

    if (person) {
      const couponsCustomer = await CouponCustomer.find({ person }).lean();
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

    filter.status = true;

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

    filter.dateInit = {
      $lte: moment().utc().subtract(4, "hours").startOf("day").toDate(),
    };

    filter.dateFinish = {
      $gte: moment().utc().subtract(4, "hours").startOf("day").toDate(),
    };

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

    const customer = await Customer.findOne({
      person,
    }).lean();

    const orderStatus = await OrderStatus.findOne({
      customer,
      status: "FINISHED",
    }).lean();

    let firstOrder;
    if (orderStatus) {
      firstOrder = false;
    } else {
      firstOrder = true;
    }

    let blocked;
    let available;

    if (list.length > 0) {
      blocked = list.filter(item => {
        let numberOfTimesUsed = 0;
        if (item.couponCustomer && item.couponCustomer.length > 0 && item.couponCustomer[0].numberOfTimesUsed) {
          numberOfTimesUsed = item.couponCustomer[0].numberOfTimesUsed;
        }

        if (subTotal < item.minPriceDelivery || item.limit <= numberOfTimesUsed || (item.onlyFirstPurchase && !firstOrder)) {
          return item;
        }
      });

      available = list.filter(item => {
        let numberOfTimesUsed = 0;
        if (item.couponCustomer && item.couponCustomer.length > 0 && item.couponCustomer[0].numberOfTimesUsed) {
          numberOfTimesUsed = item.couponCustomer[0].numberOfTimesUsed;
        }

        if (subTotal >= item.minPriceDelivery && item.limit > numberOfTimesUsed) {
          if (item.onlyFirstPurchase && !firstOrder) {
            return;
          }
          return item;
        }
      });
    }

    return res.json({ coupons: list, blocked, available });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/CouponsCompanyAvailable.js',
    error: dadosDoErro?.message,
    method: 'CouponsCompanyAvailable',
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
      mesage: "Falha ao encontrar os cupons da empresa",
      error: dadosDoErro.message,
    });
  }
};
