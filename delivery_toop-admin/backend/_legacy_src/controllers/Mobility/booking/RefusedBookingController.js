const { Types } = require("mongoose");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const refusedBooking = async (request, reply) => {
  try {
    const { booking, driver } = request.query;

    if (!booking) {
      return reply.status(400).send({
        message: "Informe uma solicitação válida",
      });
    }

    if (!driver) {
      return reply.status(400).send({
        message: "Informe um motorista",
      });
    }

    const Booking = await BookingModel.findById(booking).lean();

    if (!Booking || !Booking._id) {
      return reply.status(400).send({
        message: "Nenhuma solicitação encontrada",
      });
    }

    let refused = [new Types.ObjectId(driver)];

    if (Booking && Array.isArray(Booking.refused) && Booking.refused.length > 0) {
      refused = refused.concat(refused, Booking.refused);
    }

    await BookingModel.updateOne(
      { _id: booking },
      {
        refused: refused,
      },
    );

    return reply.send({
      message: "OK!",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/booking/RefusedBookingController.js',
      error: err?.message,
      method: 'refusedBooking',
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
      message: "Não foi possível recusar",
      err: err.message,
    });
  }
};

module.exports = refusedBooking;
