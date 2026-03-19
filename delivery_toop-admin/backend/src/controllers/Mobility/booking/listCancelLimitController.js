const moment = require("moment");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const limitMinutes = 10;

/** Lista de Reservas para serem canceladas */
const listCanceLimit = async (request, reply) => {
  try {
    const { limit = 2 } = request.query;

    const dataOld = moment().utc(false).subtract(limitMinutes, "minutes").toDate();

    const list = await BookingModel.aggregate([
      {
        $match: {
          status: "waiting",
          createdAt: {
            $lt: dataOld,
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
        },
      },
      {
        $limit: limit,
      },
    ]);

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/booking/listCancelLimitController.js',
      error: err?.message,
      method: 'listCanceLimit',
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
      message: "Não conseguimos concluir sua solicitação",
      err: err.message,
    });
  }
};

module.exports = listCanceLimit;
