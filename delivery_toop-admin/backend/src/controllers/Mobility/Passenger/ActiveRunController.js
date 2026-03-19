const moment = require("moment");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const activeRun = async (request, reply) => {
  try {
    const { passenger } = request.params;

    const response = await BookingModel.findOne({
      passenger: passenger,
      status: {
        $in: ["waiting", "accepted", "in_progress"],
      },
    })
      .populate({
        path: "driver",
        select: {
          _id: 1,
          name: 1,
          vehicleManufacturer: 1,
          vehicleModel: 1,
          vehicleNameplate: 1,
          driverScoreAndName: 1,
          stars: 1,
          location: 1,
          selfiePhoto: 1,
          ddi: 1,
          phone: 1,
        },
      })
      .populate({
        path: "franchise",
        select: {
          showPhoneRace: 1,
        },
      })
      .populate({
        path: "service",
        select: {
          type: 1,
          showArrivalTime: 1,
        },
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (response && response.createdAt) {
      const dataCurrent = moment().utc(false);
      response.time = dataCurrent.diff(response.createdAt, "seconds");
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/Passenger/ActiveRunController.js",
      error: err?.message,
      method: "activeRun",
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

    console.log(`Log de erro criado com sucesso.`);

    return reply.status(400).send({
      message: "Não foi possível listar corrida ativa",
      err: err.message,
    });
  }
};

module.exports = activeRun;
