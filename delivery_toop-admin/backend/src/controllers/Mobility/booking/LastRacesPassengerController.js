const mongoose = require("mongoose");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const lastRacesPassenger = async (request, reply) => {
  try {
    const { passenger, latitude, longitude } = request.query;

    const list = await BookingModel.aggregate([
      {
        $match: {
          passenger: new mongoose.Types.ObjectId(passenger),
        },
      },
      {
        $project: {
          _id: 1,
          passenger: 1,
          destiny: 1,
          createdAt: 1,
        },
      },
      {
        $limit: 3,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return reply.send(list);
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Mobility/booking/LastRacesPassengerController.js',
    error: err?.message,
    method: 'lastRacesPassenger',
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
      message: "Não foi possível listar historico",
      err: err.message,
    });
  }
};

module.exports = lastRacesPassenger;
