const moment = require("moment");
/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
/** Service */
const database = require("../../../services/firebase");
const apiPushNotification = require("../../../services/notification");
const LogModel = require("../../../models/LogModel");
const { notifyMonitoring } = require("../../../services/monitoring/notifyMonitoring");

const ConfirmInProgress = async (request, reply) => {
  try {
    const { driverId, bookingId, arrival = false, arrivedStops = null } = request.body || {};

    const booking = await BookingModel.findOne({
      _id: bookingId,
      driver: driverId,
      status: arrivedStops === null ? "accepted" : "in_progress",
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

    const historicAction = booking?.historicAction || {};

    if (`${arrival}` === "true") {
      historicAction.arrivedLocal = {
        arrivedLocal: true,
        date: moment().utc(false).toDate(),
      };

      // confirmar que chegou no local
      await BookingModel.updateOne(
        {
          _id: booking,
        },
        {
          arrivedLocal: true,
          historicAction: historicAction,
        },
      );

      realTimeNotifyUser(booking.passenger._id, {
        type: "race_arrival",
        booking: booking._id.toString(),
        arrival: true,
      });

      if (booking.passenger && booking.passenger.token) {
        sendPushNotification(booking.passenger.token, "Motorista chegou no local de embarque");
      }

      return reply.send({
        message: "Atualizado com sucesso!",
      });
    }

    let stops = 0;

    if (arrivedStops !== null) {
      stops = booking.arrivedStops + 1;
    }

    if (!historicAction?.stop || !Array.isArray(historicAction?.stop)) {
      historicAction.stop = [];
    }

    historicAction.stop.push({
      stop: stops,
      date: moment().utc(false).toDate(),
    });

    await BookingModel.updateOne(
      {
        _id: booking,
      },
      {
        status: "in_progress",
        arrivedStops: stops,
        historicAction: historicAction,
      },
    );

    realTimeNotifyUser(booking.passenger._id, {
      type: "race_inprogres",
      booking: booking._id.toString(),
    });

    if (arrivedStops === null && booking.passenger && booking.passenger.token) {
      sendPushNotification(booking.passenger.token, "Você está a caminho do seu destino");
    }

    notifyMonitoring(booking?._id, booking?.franchise, "in_progress", request);

    return reply.send({
      message: "Atualizado com sucesso!",
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/ConfirmInProgress.js",
      error: err?.message,
      method: "ConfirmInProgress",
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
      message: "Não conseguimos atualizar sua solicitação",
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
const sendPushNotification = async (token, message) => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: message,
        auth: token,
      },
      params: {
        title: "Solicitação",
        message: message,
      },
    });
  } catch (err) {
    console.log("err sendPushNotification", err);
  }
};

module.exports = ConfirmInProgress;
