const mongoose = require("mongoose");
const moment = require("moment");

const Driver = require("../../../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../../../models/LogModel");

const DriverList = async (request, reply) => {
  try {
    const { driverId, pageIn, pageOut, status, email, startDate, endDate, order, direction } = request.query;

    const filter = {};
    let sort = { name: 1 };
    const zoneH = -3;

    if (!pageIn || !pageOut) {
      return req.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    filter.deletedAt = { $exists: false };

    if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
      filter._id = new mongoose.Types.ObjectId(driverId);
    }

    if (email) {
      const decodeEmail = decodeURIComponent(email);
      filter.email = {
        $regex: ".*" + decodeEmail.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
        $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
      };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    }

    if (order && direction) {
      let orderAtual = order;

      if (order === "totalRating") {
        orderAtual = "rating.totalRating";
      }

      sort = { [orderAtual]: parseInt(direction) };
    }

    const DriverData = await Driver.find(filter)
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut))
      .sort(sort);

    const numTotal = await Driver.find(filter).countDocuments();

    reply.send({
      list: DriverData,
      total: numTotal,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/report/adm/driver/PaginatorDriverController.js",
      error: err?.message,
      method: "DriverList",
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

    reply.status(400).send({
      message: "Não foi possível listar",
      err: err.message,
    });
  }
};

module.exports = DriverList;
