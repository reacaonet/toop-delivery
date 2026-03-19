const Coupon = require("../../models/Coupon/CouponModel");

const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const CompanyModel = require("../../models/Company/CompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut } = req.query;
    const { franchises = [], companies = [] } = req;

    const filter = {};

    if (franchises) {
      filter.franchise = {
        $in: franchises,
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    let list = await Coupon.find(filter)
      .populate("franchise")
      .sort({ createdAt: -1 })
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .lean();

    let index = 0;

    for (let i = 0; i < list.length; i++) {
      const couponCompany = await CouponCompany.findOne({ coupon: list[i]._id, companies: { $elemMatch: { $in: companies } } })
        .populate("companies")
        .lean();

      list[i].companies = couponCompany ? couponCompany.companies : [];
    }

    // list = list.filter((i) => i.companies.length > 0);

    let numTotal = await Coupon.find().countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/PaginatorController.js',
    error: dadosDoErro?.message,
    method: 'PaginatorController',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};
