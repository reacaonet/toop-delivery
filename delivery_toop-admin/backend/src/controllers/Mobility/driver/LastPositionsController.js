const DriverLocationModel = require("../../../models/Mobility/Driver/DriverLocationModel");
const LogModel = require("../../../models/LogModel");
const mongoose = require("mongoose");

const lastPositions = async (request, reply) => {
  try {
    const { driver } = request.params;
    const { idPointer = null, booking = null } = request.query || {};

    const filter = {};

    if (!driver || !mongoose.Types.ObjectId.isValid(driver)) {
      return reply.status(400).send({
        message: "Informe um motorista válido",
      });
    }

    if (idPointer) {
      filter._id = {
        $gt: new mongoose.Types.ObjectId(idPointer),
      };
    }

    filter.driver = new mongoose.Types.ObjectId(driver);

    if (booking && mongoose.Types.ObjectId.isValid(booking)) {
      filter.booking = new mongoose.Types.ObjectId(booking);
    }

    let list = await DriverLocationModel.aggregate([
      {
        $match: filter,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: idPointer ? 50 : 5,
      },
    ]);

    if (list && list.length > 0) {
      list = list.map(item => {
        return {
          ...item,
          location: {
            latitude: item.location.coordinates[1],
            longitude: item.location.coordinates[0],
          },
        };
      });
    }

    return reply.send(list.reverse());
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/v1/mobility/driver/LastPositionsController.ts",
      error: err?.message,
      method: "lastPositions",
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
      },
    });

    return reply.status(400).send({
      message: "Não foi recuperar lista posição",
      err: err.message,
    });
  }
};

module.exports = lastPositions;
