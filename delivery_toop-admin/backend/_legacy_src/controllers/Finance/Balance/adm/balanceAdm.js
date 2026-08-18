const mongoose = require("mongoose");
const moment = require("moment");

/** Model */
const PaymentModel = require("../../../../models/Shopping/PaymentModel");
const LogModel = require("../../../../models/LogModel");

const balanceAdm = async (req, res) => {
  try {
    const { pageIn = 0, pageOut = 10, startDate, endDate, franchiseFilter, typePayment, status } = req.query;
    const { isRoot, companies = [] } = req;

    let timeZone = "America/Sao_Paulo";
    let zoneH = -3;
    let filterPayment = {};
    let filter = {};
    const aggregate = [];

    if (startDate && endDate) {
      filterPayment.createdAt = {
        $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
        $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
      };
    }

    if (franchiseFilter) {
      filter["company.franchise"] = mongoose.Types.ObjectId(franchiseFilter);
    }

    if (typePayment && typeof typePayment === "string") {
      if (typePayment === "APP") {
        filter["typePayment"] = { $in: ["PAGARME", "BRASPAG", "PIX"] };
      } else {
        filter["typePayment"] = `${typePayment}`;
      }
    }

    if (status && typeof status === "string" && status !== "all") {
      filter["order.status"] = status;
    }

    aggregate.push({ $match: filterPayment });

    aggregate.push({
      $project: {
        payload: 0,
        braspagNotification: 0,
        statusNotification: 0,
        partialChargebackPayload: 0,
      },
    });

    aggregate.push({
      $lookup: {
        from: "company",
        let: { id: "$company" },
        as: "company",
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", "$$id"] } },
          },
          {
            $lookup: {
              from: "company_delivery",
              localField: "companyDelivery",
              foreignField: "_id",
              as: "companyDelivery",
            },
          },
          {
            $unwind: { path: "$companyDelivery", preserveNullAndEmptyArrays: true },
          },
        ],
      },
    });

    aggregate.push({
      $unwind: { path: "$company", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({
      $lookup: {
        from: "orderStatus",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    });

    aggregate.push({
      $unwind: { path: "$order", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({ $match: filter });

    aggregate.push({
      $group: {
        _id: 1,
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
        priceDelivery: {
          $sum: {
            $cond: {
              if: { $eq: ["$order.status", "FINISHED"] },
              then: { $ifNull: ["$priceDelivery", 0] },
              else: 0,
            },
          },
        },
        collectDelivery: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$order.status", "FINISHED"] },
                  // { $eq: ["$company.companyDelivery.own_delivery", true] },
                  { $eq: [null, { $ifNull: ["$order.deliveryMan", null] }] },
                ],
              },
              then: { $ifNull: ["$priceDelivery", 0] },
              else: 0,
            },
          },
        },
        aproved_count: {
          $sum: {
            $cond: {
              if: { $eq: ["$order.status", "FINISHED"] },
              then: 1,
              else: 0,
            },
          },
        },
        passAlongFranchise: {
          // Repassar Franquia
          $sum: {
            $cond: {
              if: {
                $and: [{ $eq: ["$order.status", "FINISHED"] }, { $in: ["$order.typePayment", ["BRASPAG", "PAGARME", "PIX"]] }],
              },
              then: {
                $sum: [
                  {
                    $subtract: [
                      "$total",
                      {
                        $sum: [
                          "$debitPriceAdm",
                          {
                            $cond: {
                              if: {
                                $and: [
                                  // { $eq: ["$company.companyDelivery.own_delivery", false] },
                                  { $eq: ["$order.deliveryMan", { $ifNull: ["$order.deliveryMan", null] }] },
                                  { $gte: ["$priceDelivery", 0] },
                                ],
                              },
                              then: "$priceDelivery",
                              else: 0,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              else: 0,
            },
          },
        },
        receiveFranchise: {
          // Receber Franquia
          $sum: {
            $cond: {
              if: {
                $and: [{ $eq: ["$order.status", "FINISHED"] }, { $in: ["$order.typePayment", ["MONEY", "CARD"]] }],
              },
              then: {
                $sum: [
                  "$debitPriceAdm",
                  {
                    $cond: {
                      if: {
                        $and: [
                          // { $eq: ["$company.companyDelivery.own_delivery", false] },
                          { $eq: ["$order.deliveryMan", { $ifNull: ["$order.deliveryMan", null] }] },
                          { $gte: ["$priceDelivery", 0] },
                        ],
                      },
                      then: "$priceDelivery",
                      else: 0,
                    },
                  },
                ],
              },
              else: 0,
            },
          },
        },
        aproved_count: {
          $sum: {
            $cond: {
              if: { $eq: ["$order.status", "FINISHED"] },
              then: 1,
              else: 0,
            },
          },
        },
        value: { $sum: { $ifNull: ["$total", 0] } },
      },
    });

    const balance = await PaymentModel.aggregate(aggregate);

    return res.status(200).send(balance && balance.length > 0 ? balance[0] : {});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/Balance/adm/balanceAdm.js',
      error: err?.message,
      method: 'balanceAdm',
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
      message: "Não foi possivel listar balanço",
      err: err.message,
    });
  }
};

module.exports = balanceAdm;
