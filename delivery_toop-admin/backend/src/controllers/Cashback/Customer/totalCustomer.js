const mongoose = require("mongoose");

/* Models */
const CashbackCustomerBalanceModel = require("../../../models/Cashback/CashbackCustomerBalanceModel");
const LogModel = require('../../../models/LogModel');

const totalCashCustomer = async (req, res) => {
  try {
    const { customer } = req.params;

    if (!customer || !mongoose.isValidObjectId(customer)) {
      return res.status(400).send({
        message: "Informe um customer",
      });
    }

    let timeZone = "America/Sao_Paulo";
    let zoneH = -3;

    const list = await CashbackCustomerBalanceModel.findOne({
      customer: mongoose.Types.ObjectId(customer),
    }).sort({ createdAt: -1 });

    return res.status(200).send({ balance: list.cash });
  } catch (err) {
  await LogModel.create({
    path: '',
    error: err?.message,
    method: '',
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

    HTMLFormControlsCollection.log(err);
    return res.status(400).send({
      message: "falha ao listar informações",
      err: err.message,
    });
  }
};

module.exports = totalCashCustomer;
