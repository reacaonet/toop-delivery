const mongoose = require("mongoose");

/* Models */
const CashCustomerModel = require("../../../models/Cashback/CashbackCustomerModel");
const LogModel = require("../../../models/LogModel");

const cashPaginator = async (req, res) => {
  try {
    const { pageIn = 0, pageOut = 20, campaign } = req.query;

    if (campaign && !mongoose.isValidObjectId(campaign)) {
      return res.status(400).send({
        message: "Informe uma campanha válida",
      });
    }

    let filter = {};
    if (campaign) {
      filter = {
        campaign: mongoose.Types.ObjectId(campaign),
      };
    }

    const list = await CashCustomerModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "customer",
          let: { id: "$customer" },
          as: "customer",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $project: { person: 1 },
            },
            {
              $limit: 1,
            },
            {
              $lookup: {
                from: "person",
                let: { id: "$person" },
                as: "person",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      phone: 1,
                      email: 1,
                    },
                  },
                  {
                    $limit: 1,
                  },
                ],
              },
            },
            {
              $unwind: { path: "$person", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "payment",
          let: { id: "$payment" },
          as: "payment",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $project: {
                order: 1,
                total: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
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
                status: 1,
                createdAt: 1,
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
        $lookup: {
          from: "cashback_campaign",
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $unwind: { path: "$campaign", preserveNullAndEmptyArrays: true },
      },
      {
        $skip: parseInt(pageIn) * parseInt(pageOut),
      },
      {
        $limit: parseInt(pageOut),
      },
    ]);

    let numTotal = await CashCustomerModel.find(filter).count();

    return res.status(200).send({
      list,
      total: numTotal,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Cashback/Customer/cashPaginator.js',
      error: err?.message,
      method: 'cashPaginator',
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

    console.log("err", err);

    return res.status(400).send({
      message: "falha ao listar informações",
      err: err.message,
    });
  }
};

module.exports = cashPaginator;
