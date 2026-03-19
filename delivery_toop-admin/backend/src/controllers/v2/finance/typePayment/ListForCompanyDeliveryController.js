const mongoose = require("mongoose");
const FncTypePayments = require('../../../models/Finance/TypePaymentsModel');
const CompanyDelivery = require('../../../models/Company/CompanyDeliveryModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const companyDeliveryId = req.params.companyDeliveryId;

    if (companyDeliveryId && !mongoose.Types.ObjectId.isValid(companyDeliveryId)) {
      return res.status(400).send({ message: "CompanyDelivery inválida" });
    }

    const companyDelivery = await CompanyDelivery.findById(companyDeliveryId);

    if (!companyDelivery) {
      return res.status(400).send({ message: "CompanyDelivery não encontrada" });
    }

    const list = await FncTypePayments.find({ _id: { $in: companyDelivery.typePayments } });

    if (list.length === 0) {
      return res.json(list)
    }

    const group = list.reduce((r, a) => {
      r[a.type] = [...r[a.type] || [], a];
      return r;
    }, {});

    return res.json(group)
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/v2/finance/typePayment/ListForCompanyDeliveryController.js',
    error: err?.message,
    method: 'ListForCompanyDeliveryController',
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
      message: "Falha ao encontrar tipos de pagamento",
      Error: dadosDoErro
    });
  }
};
