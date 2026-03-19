/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const PaymentModel = require("../../../models/Mobility/Payment/PaymentModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");
const { notifyMonitoring } = require("../../../services/monitoring/notifyMonitoring");

const database = require("../../../services/firebase");

const { chargeBack } = require("../../../controllers/Finance/chargeback");

const canceledPassenger = async (request, reply) => {
  try {
    const { bookingId } = request.params;
    const { reason = "cancelamento padrão" } = request.body || {};

    // implementar regra de cancelamento

    let booking = await BookingModel.findOne({ _id: bookingId }).lean();

    if (!booking || !booking._id) {
      return reply.status(400).send({
        message: "Solicitação não encontrada",
      });
    }

    if (booking.status === "in_progress") {
      return reply.status(400).send({
        message: "Não é possível cancelar, corrida está em andamento",
      });
    }

    await BookingModel.updateOne(
      { _id: bookingId },
      {
        status: "canceled",
        reason: reason,
      },
    );

    if (booking.passenger) {
      realTimeNotifyUser(booking.passenger, {
        type: "race_canceled",
        booking: booking._id.toString(),
      });
    }

    if (booking.driver) {
      releaseDriver(booking.driver);
      realTimeNotifyDriver(booking.driver, {
        type: "race_canceled",
        booking: booking._id.toString(),
      });
    }

    booking = await BookingModel.findOne({
      _id: bookingId,
    }).lean();

    await chargeBack(booking.payment);

    notifyMonitoring(booking?._id, booking?.franchise, booking?.status, request);

    return reply.send({
      message: "Solicitação Cancelada",
      booking,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/CanceledPassengerController.js",
      error: err?.message,
      method: "canceledPassenger",
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
      message: "Não foi possível cancelar solicitação",
      err: err.message,
    });
  }
};

// notificar usuário de corrida cancelada
const realTimeNotifyUser = async (passengerId, params = {}) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}passenger/${passengerId}`).set(params);
  } catch (err) {
    console.log("err realTimeNotifyUser", err);
  }
};

// notifica motorista corrida cancelada
const realTimeNotifyDriver = async (driverId, params = {}) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}driver/${driverId}`).set(params);
  } catch (err) {
    console.log("err realTimeNotifyUser", err);
  }
};

// Liberar Motorista
const releaseDriver = async driverId => {
  // implementar regras posteriormente de libear motorista
  await DriverModel.updateOne(
    {
      _id: driverId,
    },
    {
      activeRun: [],
      activeRunStatus: "available",
    },
  );
};

module.exports = canceledPassenger;
