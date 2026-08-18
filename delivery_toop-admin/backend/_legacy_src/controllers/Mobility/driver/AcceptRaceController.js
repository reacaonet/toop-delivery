/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");
const { notifyMonitoring } = require("../../../services/monitoring/notifyMonitoring");

/** Service */
const database = require("../../../services/firebase");
const apiPushNotification = require("../../../services/notification");

const acceptRaceController = async (request, reply) => {
  try {
    const { driverId, bookingId } = request.body;

    const booking = await BookingModel.findById(bookingId).populate("passenger").lean();

    if (!booking || !booking._id) {
      return reply.status(400).send({
        message: "Solicitação não encontrada",
      });
    }

    if (booking.status === "accepted") {
      return reply.status(400).send({
        message: "Solicitação já foi aceita",
      });
    }

    if (booking.status !== "waiting" && booking.status !== "scheduled") {
      return reply.status(400).send({
        message: "não é mais possível aceitar esta solicitação",
      });
    }

    const driver = await DriverModel.findById(driverId).lean();

    if (!driver || !driver._id) {
      return reply.status(400).send({
        message: "Motorista não encontrado",
      });
    }

    const activeRun = driver.activeRun && Array.isArray(driver.activeRun) ? driver.activeRun : [];

    activeRun.push(bookingId);

    const payloadDriver = {
      activeRun: activeRun,
    };

    if (driver.activeRunStatus === "available") {
      payloadDriver.activeRunStatus = "race_accepted";
    }

    await DriverModel.updateOne({ _id: driverId }, payloadDriver);

    // if (!upDelivery || upDelivery.modifiedCount <= 0) {
    //   return reply.status(400).send({
    //     message: 'Não foi possível alterar status',
    //   });
    // }

    await BookingModel.updateOne(
      { _id: bookingId },
      {
        driver: driverId,
        status: "accepted",
      },
    );

    realTimeNotifyUser(booking.passenger._id, {
      type: "race-accepted",
      booking: booking._id.toString(),
      driverId: driver._id.toString(),
      driverName: driver.name,
      driverLocation: driver.location,
    });

    if (booking.passenger && booking.passenger.token) {
      sendPushNotification(booking.passenger.token);
    }

    notifyMonitoring(booking?._id, booking?.franchise, "accepted", request);

    return reply.send({
      bookingId,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/driver/AcceptRaceController.js",
      error: err?.message,
      method: "acceptRaceController",
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
      message: "Não foi possível aceitar corrida",
      err: err.message,
    });
  }
};

// notificar usuário de corrida ativa
const realTimeNotifyUser = async (passengerId, params = {}) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}passenger/${passengerId}`).set(params);
  } catch (err) {
    console.log("err realTimeNotifyUser", err);
  }
};

// Push
const sendPushNotification = async token => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: "Solicitação corrida aceita",
        auth: token,
      },
      params: {
        title: "Solicitação",
        message: "Solicitação corrida aceita",
      },
    });
  } catch (err) {
    console.log("err sendPushNotification", err);
  }
};

module.exports = acceptRaceController;
