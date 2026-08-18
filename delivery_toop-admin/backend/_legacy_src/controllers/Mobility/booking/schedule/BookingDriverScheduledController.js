const { Types } = require("mongoose");

/** Model */
const BookingModel = require("../../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../../models/LogModel");

const bookingDriverScheduled = async (request, reply) => {
  try {
    const { driver } = request.params || {};
    const filter = {};

    filter.driver = new Types.ObjectId(driver);
    filter.status = "scheduled";

    const bookings = await BookingModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "paymentDriver",
          let: {
            payment: "$payment",
            priceOfferDriver: "$priceOfferDriver",
          },
          as: "payment",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$payment"] },
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                debitPriceAdm: 1,
                debitPriceFranchise: 1,
                driverTotal: {
                  // valor liquido para o motorista
                  $subtract: [
                    {
                      $cond: {
                        if: {
                          $and: [
                            {
                              $gt: ["$$priceOfferDriver", 0],
                            },
                          ],
                        },
                        then: "$$priceOfferDriver",
                        else: "$total",
                      },
                    },
                    {
                      $sum: [{ $ifNull: ["$debitPriceAdm", 0] }, { $ifNull: ["$debitPriceFranchise", 0] }],
                    },
                  ],
                },
                coin: 1,
                currencySymbol: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "passenger",
          let: { id: "$passenger" },
          as: "passenger",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$id"] } },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                person: 1,
                stars: 1,
              },
            },
            {
              $lookup: {
                from: "person",
                let: { id: "$person" },
                as: "person",
                pipeline: [
                  {
                    $match: { $expr: { $eq: ["$_id", "$$id"] } },
                  },
                  {
                    $limit: 1,
                  },
                  {
                    $project: {
                      name: 1,
                      image: 1,
                      genre: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $unwind: { path: "$passenger", preserveNullAndEmptyArrays: true } },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return reply.send({
      list: bookings,
    });
  } catch (err) {
    await LogModel.create({
      path: "backend/src/controllers/Mobility/booking/schedule/BookingDriverScheduledController.js",
      error: err?.message,
      method: "bookingDriverScheduled",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
        appversion: request?.headers?.appversion,
      },
    });

    return reply.status(400).send({
      err: err.message,
      message: "não foi possível criar agendamento",
    });
  }
};

module.exports = bookingDriverScheduled;
