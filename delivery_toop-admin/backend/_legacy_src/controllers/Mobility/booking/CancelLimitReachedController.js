/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");
const { notifyMonitoring } = require("../../../services/monitoring/notifyMonitoring");

/** Service */
const database = require("../../../services/firebase");
const apiPushNotification = require("../../../services/notification");

const cancelLimitReached = async (request, reply) => {
  try {
    const { bookingId } = request.body;

    const booking = await BookingModel.findOne({
      _id: bookingId,
      status: "waiting",
    })
      .populate("passenger", {
        token: 1,
      })
      .lean();

    if (!booking) {
      return reply.status(400).send({
        message: "Solicitação não encontrada ou não disponível",
      });
    }

    await BookingModel.updateOne(
      {
        _id: booking,
      },
      {
        status: "canceled",
        reason: "limite para encontrar motorista atingido",
      },
    );

    await realTimeNotifyUser(booking.passenger._id, {
      type: "race_canceled",
      booking: booking._id.toString(),
    });

    if (booking.passenger && booking.passenger.token) {
      sendPushNotification(booking.passenger.token);
    }

    notifyMonitoring(booking?._id, booking?.franchise, booking?.status, request);

    return reply.send({
      message: "Solicitação Cancelada",
    });
  } catch (err) {
    LogModel.create({
      path: "src/controllers/Mobility/booking/CancelLimitReachedController.js",
      error: err?.message,
      method: "cancelLimitReached",
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
      message: "Não conseguimos concluir sua solicitação",
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

// Push
const sendPushNotification = async token => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: "Corrida cancelada, motorista não encontrado",
        auth: token,
      },
      params: {
        title: "Solicitação Cancelada",
        message: "Corrida cancelada, motorista não encontrado",
      },
    });
  } catch (err) {
    console.log("err sendPushNotification", err);
  }
};

module.exports = cancelLimitReached;
