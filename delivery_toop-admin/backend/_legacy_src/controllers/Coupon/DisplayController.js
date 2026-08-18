const moment = require("moment");

const Coupon = require("../../models/Coupon/CouponModel");
const CouponCustomer = require("../../models/Coupon/CouponCustomerModel");
const getFranchise = require("../../services/franchise");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { status, dateInit, dateFinish, person, latitude, longitude } = req.query;
    let filter = {};

    if (latitude && longitude) {
      filter.franchise = await getFranchise(latitude, longitude);
    } else {
      filter.franchise = null;
    }

    if (status) {
      filter.status = {
        $eq: status === "true" ? true : false,
      };
    }

    if (person) {
      const couponsCustomer = await CouponCustomer.find({
        person: {
          $eq: person,
        },
      });

      if (couponsCustomer && couponsCustomer.length > 0) {
        let couponIds = couponsCustomer.map(item => {
          return item.coupon;
        });

        filter._id = {
          $nin: couponIds,
        };
      }
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
        $lte: new Date(moment().utc().startOf().format("YYYY-MM-DD")),
      };
      filter.dateFinish = {
        $gte: new Date(moment().utc().endOf().format("YYYY-MM-DD")),
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await Coupon.find(filter).lean();
    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/DisplayController.js',
    error: dadosDoErro?.message,
    method: 'DisplayController',
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
      mesage: "Falha ao encontrar Cupons",
      error: dadosDoErro,
    });
  }
};
