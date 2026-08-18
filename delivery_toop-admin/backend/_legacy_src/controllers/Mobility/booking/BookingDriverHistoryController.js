const { Types } = require("mongoose");
const moment = require("moment");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const bookingDriverHistory = async (request, reply) => {
  try {
    const { driver } = request.params || {};
    const { days, today, onlyTotal, onlyHistoric } = request.query || {};

    const filter = {};

    filter.driver = new Types.ObjectId(driver);
    filter.status = "concluded";

    if (today) {
      filter.createdAt = {
        $gte: moment().utc(false).startOf("day").toDate(),
      };
    }

    let history = [];

    if (onlyTotal !== "true") {
      history = await BookingModel.aggregate([
        {
          $match: filter,
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
    }

    let total = 0;
    let totalRuns = 0;

    if (onlyHistoric !== "true") {
      const totalHistory = await BookingModel.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: "paymentDriver",
            let: { payment: "$payment" },
            as: "payment",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$payment"] },
                },
              },
              {
                $project: {
                  total: 1,
                  debitPriceAdm: 1,
                  debitPriceFranchise: 1,
                  totalFees: {
                    // Total das taxas
                    $sum: [{ $ifNull: ["$debitPriceAdm", 0] }, { $ifNull: ["$debitPriceFranchise", 0] }],
                  },
                  driverTotal: {
                    // valor liquido para o motorista
                    $subtract: [
                      "$total",
                      {
                        $sum: [{ $ifNull: ["$debitPriceAdm", 0] }, { $ifNull: ["$debitPriceFranchise", 0] }],
                      },
                    ],
                  },
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
          $group: {
            _id: "$driver",
            total: {
              $sum: "$payment.driverTotal",
            },
            totalRuns: {
              $sum: 1,
            },
          },
        },
      ]);

      if (totalHistory && Array.isArray(totalHistory) && totalHistory.length > 0) {
        total = totalHistory[0].total;
        totalRuns = totalHistory[0].totalRuns;
      }
    }

    return reply.send({
      total,
      totalRuns,
      list: history,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/booking/BookingDriverHistoryController.js',
      error: err?.message,
      method: 'bookingDriverHistory',
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
      message: "Não conseguimos listar o histórico",
      err: err.message,
    });
  }
};

module.exports = bookingDriverHistory;
