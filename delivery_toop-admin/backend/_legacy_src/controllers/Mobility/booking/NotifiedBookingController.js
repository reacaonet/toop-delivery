const mongoose = require("mongoose");

const NotifyQueueDriverModel = require("../../../models/Mobility/Driver/NotifyQueueDriverModel");
const LogModel = require("../../../models/LogModel");

const notifiedBooking = async (request, reply) => {
  try {
    const { booking } = request.params;

    const list = await NotifyQueueDriverModel.find({
      booking: booking,
    })
      .populate({
        path: "driver",
        select: {
          name: 1,
        },
      })
      .sort({
        createdAt: 1,
      })
      .lean();

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/NotifiedBookingController.js",
      error: err?.message,
      method: "notifiedBooking",
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
      message: "Erro na notificação do registro",
      err: err.message,
    });
  }
};

module.exports = notifiedBooking;
