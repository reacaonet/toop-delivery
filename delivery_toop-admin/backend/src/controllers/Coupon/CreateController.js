const mongoose = require("mongoose");

const Coupon = require("../../models/Coupon/CouponModel");
const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;

    if (!data.allCompanies && !data.companies && data.companies.length <= 0) {
      return res.status(400).send({
        message: "Informe pelo menos uma empresa, ou marque a opção todas as empresas",
        error: {},
      });
    }

    data._id = new mongoose.Types.ObjectId().toHexString();

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    data.onlyFirstPurchase =
      (typeof data.onlyFirstPurchase === "string" && data.onlyFirstPurchase === "") || data.onlyFirstPurchase === null ? false : data.onlyFirstPurchase;

    let coupon = await Coupon.create(data);

    if (data.companies && Array.isArray(data.companies)) {
      const couponCompanyModel = {
        coupon: data._id,
        companies: data.companies,
      };

      await CouponCompany.create(couponCompanyModel);
    }

    return res.send({
      status: 200,
      message: "Cupom criado com sucesso",
      data: coupon,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/CreateController.js',
    error: dadosDoErro?.message,
    method: 'CreateController',
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
      message: "Falha ao criar Cupom",
      error: dadosDoErro,
    });
  }
};
