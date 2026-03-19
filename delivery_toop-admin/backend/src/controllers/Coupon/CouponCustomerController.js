const moment = require("moment");
const mongoose = require("mongoose");
const CouponCustomer = require("../../models/Coupon/CouponCustomerModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { coupon, company, person, dateInit, dateFinish } = req.query;
    let filter = {};

    if (coupon && mongoose.Types.ObjectId.isValid(coupon)) {
      filter.coupon = mongoose.Types.ObjectId(coupon);
    }

    if (company && mongoose.Types.ObjectId.isValid(company)) {
      filter.company = mongoose.Types.ObjectId(company);
    }

    if (person && mongoose.Types.ObjectId.isValid(person)) {
      filter.person = mongoose.Types.ObjectId(person);
    }

    if (dateInit && dateInit !== null && dateFinish && dateFinish !== null) {
      filter.createdAt = {
        $lte: new Date(moment(dateInit).startOf().format('YYYY-MM-DD')),
        $gte: new Date(moment(dateFinish).endOf().format('YYYY-MM-DD')),
      };
    }

    const list = await CouponCustomer.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "coupon",
          let: { couponId: "$coupon" },
          as: "coupon",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$couponId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$coupon", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          'coupon.deletedAt': {
            $exists: false,
          }
        }
      },
      {
        $lookup: {
          from: "person",
          let: { personId: "$person" },
          as: "person",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$personId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "orderStatus",
          let: { orderStatusId: "$orderStatus" },
          as: "orderStatus",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$orderStatusId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "payment",
          let: { paymentId: "$payment" },
          as: "payment",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$paymentId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "customer",
          let: { customerId: "$customer" },
          as: "customer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$customerId"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      // { $unwind: { path: "$couponCompany" } },
    ]);

    return res.status(200).send(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/CouponCustomerController.js',
    error: dadosDoErro?.message,
    method: 'CouponCustomerController',
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
      mesage: "Falha ao obter cupoms",
      error: dadosDoErro,
    });
  }
};
