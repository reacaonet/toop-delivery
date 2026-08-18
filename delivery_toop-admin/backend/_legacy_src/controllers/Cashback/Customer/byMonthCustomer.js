const mongoose = require("mongoose");

/* Models */
const CashbackCustomerBalanceModel = require("../../../models/Cashback/CashbackCustomerBalanceModel");
const LogModel = require("../../../models/LogModel");

const byMonthCustomer = async (req, res) => {
  try {
    const { customer } = req.params;

    if (!customer || !mongoose.isValidObjectId(customer)) {
      return res.status(400).send({
        message: "Informe um customer",
      });
    }

    let timeZone = "America/Sao_Paulo";
    let zoneH = -3;

    const list = await CashbackCustomerBalanceModel.aggregate([
      {
        $match: {
          customer: mongoose.Types.ObjectId(customer),
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: {
                date: "$date",
                timezone: "America/Sao_Paulo",
              },
            },
            month: {
              $month: {
                date: "$date",
                timezone: "America/Sao_Paulo",
              },
            },
            cash: "$cash",
          },
          lastDate: { $max: "$date" },
        },
      },
    ]);

    return res.status(200).send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Cashback/Customer/byMonthCustomer.js',
      error: err?.message,
      method: 'byMonthCustomer',
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
      message: "falha ao listar informações",
      err: err.message,
    });
  }
};

module.exports = byMonthCustomer;
