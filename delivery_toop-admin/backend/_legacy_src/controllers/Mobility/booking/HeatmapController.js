const moment = require("moment");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel.js");

const heatMapController = async (request, reply) => {
  try {
    const { startDate, endDate } = request.query;

    const { isRoot = false, franchise } = request;
    const filter = {};

    // const timeZone = 'America/Sao_Paulo';
    const zoneH = -3;

    if (!isRoot) {
      filter.franchise = franchise;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
        $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
      };
    } else {
      filter.createdAt = {
        $gte: moment().utc(false).subtract(120, "hours").toDate(),
      };
    }

    const list = await BookingModel.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          origin: 1,
        },
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
    path: 'src/controllers/Mobility/booking/HeatmapController.js',
    error: err?.message,
    method: 'heatMapController',
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
      message: "Não foi possível buscar informações",
      err: err.message,
    });
  }
};

module.exports = heatMapController;
