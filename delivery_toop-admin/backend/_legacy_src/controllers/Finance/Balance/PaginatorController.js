const mongoose = require("mongoose");
const moment = require('moment');

const PaymentModel = require("../../../models/Shopping/PaymentModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { type, status, startDate, endDate, companyFilter, typePayment } = req.query;
    const { pageIn, pageOut } = req.query;
    const { isRoot, companies = [] } = req;

    let timeZone = "America/Sao_Paulo";
    let zoneH = -3;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    let filter = {};

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

    const body = [
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
        $match: { ...filter }
      },
      {
        $group: {
          _id: {
            companyName: "$company.name",
            orderId: "$order._id",
            orderStatus: "$order.status",
            typePayment: "$order.typePayment",
            orderNumber: "$order.order_number",
            createdAt: "$createdAt",
            date: {
              $dateToString: {
                format: "%d/%m/%Y %H:%M",
                date: "$order.createdAt",
                timezone: timeZone,
              },
            },
          },
          netValue: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$order.status", "FINISHED"],
                },
                then: {
                  $subtract: [
                    { $subtract: [{ $subtract: ["$total", { $ifNull: ["$debitPriceAdm", 0] }] }, { $ifNull: ["$priceDelivery", 0] }] },
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
          value: {
            $sum: { $ifNull: ["$total", 0] },
          },
        },
      },
      { $sort: { '_id.createdAt': -1 } }
    ];

    const bodPaninator = [...body]
    body.push({ $skip: parseInt(pageIn) * parseInt(pageOut) })
    body.push({ $limit: parseInt(pageOut) })

    const list = await PaymentModel.aggregate(body);
    const numTotal = await PaymentModel.aggregate(bodPaninator);

    return res.json({ list, total: numTotal.length });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/Balance/PaginatorController.js',
      error: err?.message,
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

    // console.log(err);
    return res.status(400).send({
      message: "Falha ao encontrar registros para Paginação",
      err: err.message,
    });
  }
};
