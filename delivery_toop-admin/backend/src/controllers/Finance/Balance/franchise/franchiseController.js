const mongoose = require("mongoose");
const moment = require("moment");

/** Model */
const PaymentModel = require("../../../../models/Shopping/PaymentModel");
const LogModel = require("../../../../models/LogModel");

const franchiseBalance = async (req, res) => {
  try {
    const { pageIn = 0, pageOut = 10, startDate, endDate, companyFilter, typePayment } = req.query;
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

    if (companyFilter) {
      filterPayment["company"] = mongoose.Types.ObjectId(companyFilter);
    } else if (!isRoot || isRoot === false) {
      filterPayment["company"] = { $in: companies };
    }

    if (typePayment && typeof typePayment === "string") {
      if (typePayment === "APP") {
        filter["typePayment"] = { $in: ["PAGARME", "BRASPAG"] };
      } else {
        filter["typePayment"] = `${typePayment}`;
      }
    }

    filter["order._id"] = { $exists: true };

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

    const agregatePaninator = [...aggregate];

    aggregate.push({
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
        fee: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$order.status", "FINISHED"],
              },
              then: { $ifNull: ["$fee", 0] },
              else: 0,
            },
          },
        },
        feeAdm: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$order.status", "FINISHED"],
              },
              then: { $ifNull: ["$feeAdm", 0] },
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

        receivePriceDelivery: {
          // BONUS DE FRETE CONCEDIDO PELA EMPRESA QUE PRECISAM SER RECEBIDOS DA EMPRESA
          $sum: {
            $cond: {
              if: {
                $and: [
                  {
                    $eq: ["$order.status", "FINISHED"],
                  },
                  {
                    $in: ["$order.typePayment", ["MONEY", "CARD", "PIX", "BRASPAG", "PAGARME"]],
                  },
                ],
              },
              then: {
                $sum: [
                  {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: ["$freeShippingBonusOrigin", "company"],
                          },
                          {
                            $gte: ["$freeShippingBonus", 0],
                          },
                        ],
                      },
                      then: "$freeShippingBonus",
                      else: 0,
                    },
                  },
                ],
              },
              else: 0,
            },
          },
        },

        collectDelivery: {
          $sum: {
            $cond: {
              if: {
                $and: [{ $eq: ["$order.status", "FINISHED"] }, { $eq: [null, { $ifNull: ["$order.deliveryMan", null] }] }],
              },
              then: { $ifNull: ["$priceDelivery", 0] },
              else: 0,
            },
          },
        },
        aproved_value: {
          $sum: {
            $cond: {
              if: { $eq: ["$order.status", "FINISHED"] },
              then: { $ifNull: ["$total", 0] },
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

    aggregate.push({
      $sort: { "_id.createdAt": -1 },
    });

    aggregate.push({ $skip: parseInt(pageIn) * parseInt(pageOut) });
    aggregate.push({ $limit: parseInt(pageOut) });

    // console.log(JSON.stringify(aggregate));

    const response = await PaymentModel.aggregate(aggregate);

    agregatePaninator.push({
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    });

    let numTotal = 0;
    const totalPaginator = await PaymentModel.aggregate(agregatePaninator);

    if (totalPaginator && totalPaginator.length > 0 && totalPaginator[0].count) {
      numTotal = totalPaginator[0].count;
    }

    return res.status(200).send({
      list: response,
      total: numTotal,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/Balance/franchise/franchiseController.js',
      error: err?.message,
      method: 'franchiseBalance',
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
      message: "Não foi possivel listar informações",
      err: err.message,
    });
  }
};

module.exports = franchiseBalance;
