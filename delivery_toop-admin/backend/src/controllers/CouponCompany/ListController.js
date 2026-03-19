const mongoose = require("mongoose");

const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const { companyId } = req.query;

    let filter = {};

    if (id && mongoose.Types.ObjectId.isValid(companyId)) {
      filter.companys = {
        $eq: companyId,
      };
    }

    let list;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      list = await CouponCompany.findById(id);
    } else if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    } else {
      list = await CouponCompany.find(filter);
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/CouponCompany/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
