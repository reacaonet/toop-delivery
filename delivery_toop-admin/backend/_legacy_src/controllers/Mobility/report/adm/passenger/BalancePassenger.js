const moment = require("moment");
const mongoose = require("mongoose");

/** Model */
const BookingModel = require("../../../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../../../models/LogModel");

const balanceReportPassenger = async (request, reply) => {
  try {
    const { startDate, endDate, status, passenger } = request.query;
    const { isRoot, franchise: loggedFranchise } = request;

    const timeZone = "America/Sao_Paulo";
    const zoneH = -3;
    const filter = {};
    const filterPayment = {};
    const aggregate = [];

    if (!isRoot) {
      filter.franchise = loggedFranchise;
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
      $match: filterPayment,
    });

    aggregate.push({
      $group: {
        _id: 1,
        aproved: {
          $sum: {
            $cond: {
              if: { $eq: ["$status", "concluded"] },
              then: 1,
              else: 0,
            },
          },
        },
        canceled: {
          $sum: {
            $cond: {
              if: { $eq: ["$status", "canceled"] },
              then: 1,
              else: 0,
            },
          },
        },
        total: {
          $sum: {
            $cond: {
              if: { $eq: ["$status", "concluded"] },
              then: "$price",
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
    path: 'httpssrc/controllers/Mobility/report/adm/passenger/BalancePassenger.js',
    error: err?.message,
    method: 'balanceReportPassenger',
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

module.exports = balanceReportPassenger;
