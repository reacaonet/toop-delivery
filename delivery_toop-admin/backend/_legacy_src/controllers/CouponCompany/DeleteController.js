const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    await CouponCompany.findOneAndRemove({ _id: id });

    res.send({
      status: 200,
      message: "Companhias removidas do Cupom com sucesso",
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/CouponCompany/DeleteController.js',
    error: dadosDoErro?.message,
    method: 'DeleteController',
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
      message: "Falha ao remover Companhias do Cupom",
      Error: dadosDoErro,
    });
  }
};
