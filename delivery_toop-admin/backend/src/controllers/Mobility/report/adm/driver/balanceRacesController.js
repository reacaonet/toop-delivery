const moment = require("moment");
const mongoose = require("mongoose");
const BookingModel = require("../../../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../../../models/LogModel");

const balanceRaces = async (request, reply) => {
  try {
    const { startDate, endDate, typePayment, status, franchise, driver } = request.query;
    const { isRoot, franchise: loggedFranchise } = request;

    const timeZone = "America/Sao_Paulo";
    const zoneH = -3;
    const filter = {};
    const filterPayment = {};
    const aggregate = [];

    if (!isRoot) {
      filter.franchise = loggedFranchise;
    }

    if (franchise) {
      filter.franchise = new mongoose.Types.ObjectId(franchise);
    }

    if (driver) {
      filter.driver = new mongoose.Types.ObjectId(driver);
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
        $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
      };
    }

    if (status && typeof status === "string" && status !== "all") {
      filter["status"] = status;
    }

    if (typePayment && typeof typePayment === "string") {
      if (typePayment === "APP") {
        filterPayment["payment.typePayment"] = {
          $in: ["PAGARME", "BRASPAG", "PIX"],
        };
      } else {
        filterPayment["payment.typePayment"] = `${typePayment}`;
      }
    }

    aggregate.push({ $match: filter });

    aggregate.push({
      $project: {
        notifiedDrivers: 0,
        notNotifiedDrivers: 0,
        __v: 0,
      },
    });

    aggregate.push({
      $lookup: {
        from: "paymentDriver",
        let: { id: "$payment" },
        as: "payment",
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", "$$id"] } },
          },
          { $limit: 1 },
          {
            $project: {
              payload: 0,
              paymentProviderId: 0,
              updatedAt: 0,
            },
          },
          {
            $addFields: {
              valueDriver: {
                $subtract: [
                  "$total",
                  {
                    $sum: [
                      {
                        $cond: {
                          if: {
                            $and: [{ $gte: ["$debitPriceAdm", 0] }],
                          },
                          then: "$debitPriceAdm",
                          else: 0,
                        },
                      },
                      {
                        $cond: {
                          if: {
                            $and: [{ $gte: ["$debitPriceFranchise", 0] }],
                          },
                          then: "$debitPriceFranchise",
                          else: 0,
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    });

    aggregate.push({
      $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({
      $match: filterPayment,
    });

    aggregate.push({
      $group: {
        _id: 1,
        aproved_count: {
          $sum: {
            $cond: {
              if: { $eq: ["$status", "concluded"] },
              then: 1,
              else: 0,
            },
          },
        },
        canceled_count: {
          $sum: {
            $cond: {
              if: { $eq: ["$status", "canceled"] },
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
                $and: [
                  { $eq: ["$status", "concluded"] },
                  {
                    $in: ["$payment.typePayment", ["BRASPAG", "PAGARME", "PIX"]],
                  },
                ],
              },
              then: {
                $sum: [
                  "$payment.valueDriver",
                  {
                    $cond: {
                      if: {
                        $and: [{ $gte: ["$payment.debitPriceFranchise", 0] }],
                      },
                      then: "$payment.debitPriceFranchise",
                      else: 0,
                    },
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
                $and: [{ $eq: ["$status", "concluded"] }, { $in: ["$payment.typePayment", ["MONEY", "CARD"]] }],
              },
              then: {
                $sum: [
                  "$payment.valueDriver",
                  {
                    $cond: {
                      if: {
                        $and: [{ $gte: ["$payment.debitPriceAdm", 0] }],
                      },
                      then: "$payment.debitPriceAdm",
                      else: 0,
                    },
                  },
                ],
              },
              else: 0,
            },
          },
        },
        valueDriver: {
          // Total Motorista receber
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$status", "concluded"] },
                  {
                    $in: ["$payment.typePayment", ["BRASPAG", "PAGARME", "PIX"]],
                  },
                ],
              },
              then: {
                $sum: ["$payment.valueDriver"],
              },
              else: 0,
            },
          },
        },
      },
    });

    const balance = await BookingModel.aggregate(aggregate);

    return reply.send(balance && balance.length > 0 ? balance[0] : {});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/report/adm/driver/balanceRacesController.js',
      error: err?.message,
      method: 'balanceRaces',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: request?.application,
        franchise: request?.franchise,
        company: request?.company,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    return reply.status(400).send({
      message: "Não foi possivel listar balanço",
      err: err.message,
    });
  }
};

module.exports = balanceRaces;
