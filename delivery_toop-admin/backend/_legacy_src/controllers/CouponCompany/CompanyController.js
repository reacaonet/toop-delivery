const mongoose = require("mongoose");
const moment = require("moment");

const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { lat, lng, page } = req.query;
    const maxDistante = process.env.maxMiles; // 8km em milhas
    const setPage = page ? page : 1;

    const coupon = {
      from: "coupon",
      let: { id: "$coupon" },
      as: "coupon",
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$id"] },
            status: true,
            deletedAt: { $exists: false },
          },
        },
      ],
    };

    const company = {
      from: "company",
      let: { id: "$companies" },
      as: "companies",
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$_id", "$$id"] },
            deletedAt: { $exists: false },
          },
        },
      ],
    };

    const list = await CouponCompany.aggregate([
      { $lookup: coupon },
      { $lookup: company },
      { $unwind: "$coupon" },
      {
        $match: {
          "coupon.status": true,
          "coupon.dateInit": {
            $lte: moment().utc().startOf().toDate(),
          },
          "coupon.dateFinish": {
            $gte: moment().utc().endOf().toDate(),
          },
        },
      },
      { $unwind: "$companies" },
      {
        $project: {
          coupon: {
            price: 1,
            status: 1,
          },
          companies: 1,
        },
      },
      {
        $match: {
          "coupon.price": { $gte: 1 },
          "companies.status": true,
          "companies.location": {
            $geoWithin: {
              $centerSphere: [[Number(lat), Number(lng)], Number(maxDistante / 3963.2)],
            },
          },
        },
      },
      {
        $group: {
          _id: "$companies._id",
          company: {
            $addToSet: "$companies",
          },
          coupon: {
            $max: "$coupon.price",
          },
        },
      },
      {
        $sort: {
          coupon: -1,
        },
      },
      { $skip: (parseInt(setPage) - 1) * 10 },
      { $limit: setPage * 10 },
    ]);

    let total = 0;

    if (`${setPage}` === "1" && Array.isArray(list) && list.length <= 0) {
      total = 0;
    } else {
      total = await CouponCompany.aggregate([
        { $lookup: coupon },
        { $lookup: company },
        { $unwind: "$coupon" },
        { $unwind: "$companies" },
        {
          $match: {
            "coupon.status": true,
            "companies.status": true,
            "companies.location": {
              $geoWithin: {
                $centerSphere: [[Number(lat), Number(lng)], Number(maxDistante / 3963.2)],
              },
            },
          },
        },
        {
          $group: {
            _id: "$companies._id",
            company: {
              $addToSet: "$companies",
            },
            coupon: {
              $max: "$coupon.price",
            },
          },
        },
        { $count: "total" },
      ]);
    }

    return res.json({
      data: list,
      pagination: {
        total_pages: total && Array.isArray(total) && total.length > 0 ? Math.ceil(total[0].total / 10) : 0,
        page: setPage,
      },
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/CouponCompany/CompanyController.js',
      error: err?.message,
      method: 'CompanyController',
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
      mesage: "Falha em listar as companys",
      err: err.message,
    });
  }
};
