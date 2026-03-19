const mongoose = require("mongoose");
const moment = require('moment');

const PaymentModel = require("../../../models/Shopping/PaymentModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { type, status, startDate, endDate, person, companyFilter, typePayment } = req.query;
    const { isRoot, companies = [] } = req;

    let filter = {};

    let timeZone = "America/Sao_Paulo";
    let zoneH = -3;

    if (startDate || endDate) {
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
          $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
        };
      } else if (startDate && !endDate) {
        filter.createdAt = {
          $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
        };
      } else {
        filter.createdAt = {
          $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
        };
      }
    }

    if (companyFilter) {
      filter['company._id'] = mongoose.Types.ObjectId(companyFilter);
    } else if (!isRoot || isRoot === false) {
      filter = { ...filter, "company._id": { $in: companies } };
    }

    if (typePayment && typeof typePayment === "string") {
      if (typePayment === "APP") {
        filter["typePayment"] = { $in: ["PAGARME", "BRASPAG"] };
      } else {
        filter["typePayment"] = `${typePayment}`;
      }
    }

    //consulta o balanço
    const list = await PaymentModel.aggregate([
      {
        $lookup: {
          from: "company",
          localField: "company",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $lookup: {
          from: "orderStatus",
          localField: "order",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $unwind: {
          path: "$company",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: "$order",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          ...filter,
        },
      },
      {
        $group: {
          _id: 1,
          netValue: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "FINISHED"],
                },
                then: {
                  $subtract: [
                    {
                      $subtract: [
                        {
                          $subtract: ["$total", { $ifNull: ["$debitPriceAdm", 0] }],
                        },
                        { $ifNull: ["$priceDelivery", 0] },
                      ],
                    },
                    { $ifNull: ["$debitPrice", 0] },
                  ],
                },
                else: 0,
              },
            },
          },
          priceDelivery: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "FINISHED"],
                },
                then: { $ifNull: ["$priceDelivery", 0] },
                else: 0,
              },
            },
          },
          debitAdm: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "FINISHED"],
                },
                then: { $ifNull: ["$debitPriceAdm", 0] },
                else: 0,
              },
            },
          },
          debitFranchise: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "FINISHED"],
                },
                then: { $ifNull: ["$debitPrice", 0] },
                else: 0,
              },
            },
          },
          aproved_value: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "FINISHED"],
                },
                then: { $ifNull: ["$total", 0] },
                else: 0,
              },
            },
          },
          aproved_count: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "FINISHED"],
                },
                then: 1,
                else: 0,
              },
            },
          },
          await_value: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$order.status", "WAIT_COMPANY"] },
                    { $eq: ["$order.status", "ACCEPT_SHOPPER"] },
                    { $eq: ["$order.status", "IN_PREPARATION"] },
                    { $eq: ["$order.status", "FINISH_PREPARATION"] },
                    { $eq: ["$order.status", "PAYMENT_REQUEST"] },
                    { $eq: ["$order.status", "WAIT_DELIVERYMAN"] },
                    { $eq: ["$order.status", "ACCEPT_DELIVERYMAN"] },
                    { $eq: ["$order.status", "MARKET_CASHIER"] },
                    { $eq: ["$order.status", "IN_PROGRESS_DELIVERYMAN"] },
                    { $eq: ["$order.status", "RELEASE_SHOPPER"] },
                    { $eq: ["$order.status", "DISPATCH"] },
                    { $eq: ["$order.status", "DELIVERY_ROUTE"] },
                  ],
                },
                { $ifNull: ["$total", 0] },
                0,
              ],
            },
          },
          await_count: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$order.status", "WAIT_COMPANY"] },
                    { $eq: ["$order.status", "ACCEPT_SHOPPER"] },
                    { $eq: ["$order.status", "IN_PREPARATION"] },
                    { $eq: ["$order.status", "FINISH_PREPARATION"] },
                    { $eq: ["$order.status", "PAYMENT_REQUEST"] },
                    { $eq: ["$order.status", "WAIT_DELIVERYMAN"] },
                    { $eq: ["$order.status", "ACCEPT_DELIVERYMAN"] },
                    { $eq: ["$order.status", "MARKET_CASHIER"] },
                    { $eq: ["$order.status", "IN_PROGRESS_DELIVERYMAN"] },
                    { $eq: ["$order.status", "RELEASE_SHOPPER"] },
                    { $eq: ["$order.status", "DISPATCH"] },
                    { $eq: ["$order.status", "DELIVERY_ROUTE"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          canceled_value: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "CANCELED"],
                },
                then: { $ifNull: ["$total", 0] },
                else: 0,
              },
            },
          },
          canceled_count: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "CANCELED"],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ]);

    return res.json(list.length > 0 ? list[0] : {});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/Balance/ListController.js',
      error: err?.message,
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

    // console.log(err);
    return res.status(400).send({
      message: "Falha ao encontrar registros para Paginação",
      err: err.message,
    });
  }
};
