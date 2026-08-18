const moment = require("moment");

const Coupon = require("../../models/Coupon/CouponModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    coupon = await Coupon.findOne({
      dateInit: {
        $lte: new Date(moment().add().startOf().format('YYYY-MM-DD')),
      },
      dateFinish: {
        $gte: new Date(moment().endOf().format('YYYY-MM-DD')),
      },
      status: true,
      deletedAt: {
        $exists: false,
      },
    })
      .sort("-price")
      .populate("couponCompany", { companys: 1 });

    return res.json(coupon);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/HighCuponController.js',
    error: dadosDoErro?.message,
    method: 'HighCuponController',
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
      mesage: "Falha ao encontrar Produto",
      error: dadosDoErro,
    });
  }
};
