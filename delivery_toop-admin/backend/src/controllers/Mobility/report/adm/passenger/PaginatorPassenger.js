const moment = require("moment");
const mongoose = require("mongoose");

/** Model */
const BookingModel = require("../../../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../../../models/LogModel");

const paginatorReportPassenger = async (request, reply) => {
  try {
    const { pageIn = 0, pageOut = 10, startDate, endDate, status, passenger } = request.query;
    const { isRoot, franchise: loggedFranchise } = request;

    const timeZone = "America/Sao_Paulo";
    const zoneH = -3;
    const filter = {};
    const filterPayment = {};
    const aggregate = [];

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(loggedFranchise);
    }

    if (passenger) {
      filter.passenger = new mongoose.Types.ObjectId(passenger);
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

    aggregate.push({ $match: filter });

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
              total: 1,
              totalAppCredit: 1,
              typePayment: 1,
              provider: 1,
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
        from: "passenger",
        let: { id: "$passenger" },
        as: "passenger",
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", "$$id"] } },
          },
          { $limit: 1 },
          {
            $project: {
              person: 1,
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
                { $limit: 1 },
                {
                  $project: {
                    name: 1,
                    phone: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: { path: "$person", preserveNullAndEmptyArrays: true },
          },
        ],
      },
    });

    aggregate.push({
      $unwind: { path: "$passenger", preserveNullAndEmptyArrays: true },
    });

    aggregate.push({
      $addFields: {
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
      path: 'src/controllers/Mobility/report/adm/passenger/PaginatorPassenger.js',
      error: err?.message,
      method: 'paginatorReportPassenger',
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
      message: "Não foi possivel listar",
      err: err.message,
    });
  }
};

module.exports = paginatorReportPassenger;
