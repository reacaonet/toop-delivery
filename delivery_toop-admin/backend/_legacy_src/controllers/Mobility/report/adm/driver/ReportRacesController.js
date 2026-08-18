/** Model */
const moment = require("moment");
const mongoose = require("mongoose");
const BookingModel = require("../../../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../../../models/LogModel");

const reportRaces = async (request, reply) => {
  try {
    const { pageIn = 0, pageOut = 10, startDate, endDate, typePayment, status, franchise, driver } = request.query;
    const { isRoot, franchise: loggedFranchise } = request;

    const timeZone = "America/Sao_Paulo";
    const zoneH = -3;
    const filter = {};
    const filterPayment = {};
    const aggregate = [];

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(loggedFranchise);
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
      $lookup: {
        from: "franchise",
        let: { id: "$franchise" },
        as: "franchise",
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", "$$id"] } },
          },
          { $limit: 1 },
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    });

    aggregate.push({
      $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({
      $lookup: {
        from: "driver",
        let: { id: "$driver" },
        as: "driver",
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", "$$id"] } },
          },
          { $limit: 1 },
          {
            $project: {
              name: 1,
              phone: 1,
              email: 1,
              rating: 1,
              franchise: 1,
            },
          },
          // {
          //   $lookup: {
          //     from: 'franchise',
          //     let: { id: '$franchise' },
          //     as: 'franchise',
          //     pipeline: [
          //       {
          //         $match: { $expr: { $eq: ['$_id', '$$id'] } },
          //       },
          //       { $limit: 1 },
          //       {
          //         $project: {
          //           name: 1,
          //         },
          //       },
          //     ],
          //   },
          // },
          // {
          //   $unwind: { path: '$franchise', preserveNullAndEmptyArrays: true },
          // },
        ],
      },
    });

    aggregate.push({
      $unwind: { path: "$driver", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({
      $addFields: {
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
        date: {
          $dateToString: {
            format: "%d/%m/%Y %H:%M",
            date: "$createdAt",
            timezone: timeZone,
          },
        },
      },
    });

    aggregate.push({
      $sort: { createdAt: -1 },
    });

    aggregate.push({ $skip: parseInt(pageIn) * parseInt(pageOut) });
    aggregate.push({ $limit: parseInt(pageOut) });

    const response = await BookingModel.aggregate(aggregate);

    return reply.send({
      list: response,
      total: 1000000,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/report/adm/driver/ReportRacesController.js",
      error: err?.message,
      method: "reportRaces",
      type: "error",
      level: 0,
      origin: "backend",
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

    return reply.status(400).send({
      message: "Falha ao encontrar Driver",
      err: err.message,
    });
  }
};

module.exports = reportRaces;
