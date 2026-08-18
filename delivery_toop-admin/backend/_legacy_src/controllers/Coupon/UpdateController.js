const Coupon = require("../../models/Coupon/CouponModel");

const CouponCompany = require("../../models/Coupon/CouponCompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!data.allCompanies && data.companies.length <= 0) {
      return res.status(400).send({
        message: "Informe pelo menos uma empresa, ou marque a opção todas as empresas",
        error: {},
      });
    }

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    data.onlyFirstPurchase =
      (typeof data.onlyFirstPurchase === "string" && data.onlyFirstPurchase === "") || data.onlyFirstPurchase === null ? false : data.onlyFirstPurchase;

    const novoRegistro = await Coupon.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: true,
        new: true,
      },
    );

    if (data.companies && Array.isArray(data.companies)) {
      await CouponCompany.updateOne(
        {
          coupon: id,
        },
        {
          $set: {
            companies: data.companies,
          },
        },
        {
          upsert: false,
        },
      );
    }

    res.send({
      status: 200,
      message: "Cupom atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Coupon/UpdateController.js',
    error: dadosDoErro?.message,
    method: 'UpdateController',
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
      message: "Falha ao atualizar Cupom",
      Error: dadosDoErro,
    });
  }
};
