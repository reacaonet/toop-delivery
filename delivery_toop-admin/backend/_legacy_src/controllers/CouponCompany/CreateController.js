const mongoose = require('mongoose');
const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    let couponCompany = await CouponCompany.create(data);

    return res.send({
      status: 200,
      message: "Companhia vinculada ao cupom com sucesso",
      data: couponCompany,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/CouponCompany/CreateController.js',
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
      message: "Falha ao vincular Companhias ao Cupom",
      error: dadosDoErro,
    });
  }
};
