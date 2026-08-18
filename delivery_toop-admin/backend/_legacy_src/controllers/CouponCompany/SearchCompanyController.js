const mongoose = require("mongoose");
const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const coupon = {
      from: "coupon",
      localField: "coupon",
      foreignField: "_id",
      as: "coupon",
    };

    const company = {
      from: "company",
      localField: "companies",
      foreignField: "_id",
      as: "companies",
    };

    const list = await CouponCompany.aggregate([
      { $lookup: coupon },
      { $lookup: company },
      { $unwind: "$coupon" },
      { $unwind: "$companies" },
      {
        $project: {
          coupon: {
            price: 1,
          },
          companies: {
            _id: 1,
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
        }
      },
    ]);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/CouponCompany/SearchCompanyController.js',
    error: dadosDoErro?.message,
    method: 'SearchCompanyController',
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
      mesage: "Falha na busca de Cupons",
      error: dadosDoErro,
    });
  }
};
