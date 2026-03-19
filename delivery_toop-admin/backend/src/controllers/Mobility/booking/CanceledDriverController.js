/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const PaymentModel = require("../../../models/Mobility/Payment/PaymentModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");
const { notifyMonitoring } = require("../../../services/monitoring/notifyMonitoring");

const database = require("../../../services/firebase");
const notificationApi = require("../../../services/notification");

const { chargeBack } = require("../../../controllers/Finance/chargeback");

const canceledDriver = async (request, reply) => {
  try {
    const { bookingId } = request.params;
    const { reason = "cancelado motorista", canceledBy = "" } = request.body || {};

    // implementar regra de cancelamento

    let booking = await BookingModel.findOne({
      _id: bookingId,
    })
      .populate({
        path: "driver",
        select: {
          _id: 1,
          token: 1,
          payment: 1,
        },
      })
      .lean();

    const payment = PaymentModel.findOne(
      {
        _id: booking.payment._id,
      },
      {
        _id: 1,
        paymentProviderId: 1,
      },
    );

    if (!booking || !booking._id) {
      return reply.status(400).send({
        message: "Solicitação não encontrada",
      });
    }

    await BookingModel.updateOne(
      { _id: bookingId },
      {
        status: "canceled",
        reason: reason,
      },
    );

    if (booking.passenger && canceledBy === "driver") {
      if (booking.driver._id) {
        releaseDriver(booking.driver._id);
      }

      realTimeNotifyUser(booking.passenger, {
        type: "race_canceled",
        booking: booking._id.toString(),
      });
    }

    if (booking.driver && booking.driver._id && canceledBy === "passenger") {
      releaseDriver(booking.driver._id);
      realTimeNotifyDriver(booking.driver._id, {
        type: "race_canceled",
        booking: booking._id.toString(),
      });

      if (booking.driver.token) {
        pushNotify(booking.driver._id, booking.driver.token, "O Passageiro cancelou a corrida");
      }
    }

    booking = await BookingModel.findOne({
      _id: bookingId,
    }).lean();

    await chargeBack(booking.payment.paymentProviderId);

    notifyMonitoring(booking?._id, booking?.franchise, booking?.status || "canceled", request);

    return reply.send({
      message: "Solicitação Cancelada",
      booking,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/CanceledDriverController.js",
      error: err?.message,
      method: "canceledDriver",
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

// push notification
const pushNotify = async (id, token, message) => {
  try {
    await notificationApi.post(`/v1/app-notification/user/${id}`, {
      user: {
        auth: token,
        message: message,
      },
    });
  } catch (err) {
    console.log("err pushNotify", err);
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

module.exports = canceledDriver;
