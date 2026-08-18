const mongoose = require("mongoose");

/* Models */
const CashCustomerModel = require("../../../models/Cashback/CashbackCustomerModel");
const LogModel = require("../../../models/LogModel");

const listCashCustomer = async (req, res) => {
  try {
    const { customer } = req.params;
    const { pageIn = 1, pageOut = 100 } = req.query;

    if (!customer || !mongoose.isValidObjectId(customer)) {
      return res.status(400).send({
        message: "Informe um customer",
      });
    }

    const list = await CashCustomerModel.aggregate([
      {
        $match: {
          customer: mongoose.Types.ObjectId(customer),
        },
      },
      {
        $lookup: {
          from: "orderStatus",
          let: { id: "$order" },
          as: "order",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $project: {
                order_number: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$order", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (pageIn - 1) * pageOut,
      },
      {
        $limit: pageOut,
      },
    ]);

    return res.status(200).send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Cashback/Customer/ListController.js',
      error: err?.message,
      method: 'listCashCustomer',
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

module.exports = listCashCustomer;
