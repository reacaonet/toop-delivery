const moment = require("moment");

/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const maxDistance = process.env.MAX_DIST_DRIVER;

const NearbyDrivers = async (request, reply) => {
  try {
    const { latitude, longitude } = request.body;

    const filter = {};

    filter.status = true;
    filter.online = true;
    filter.approved = true;
    filter.activeRunStatus = "available";
    filter.categoryServices = "driver";

    filter.updatedAt = {
      $gte: moment().utc(false).subtract(8, "hours").toDate(),
    };

    filter.deletedAt = {
      $exists: false,
    };

    const response = await DriverModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          distanceField: "distance",
          maxDistance: Number(maxDistance),
          spherical: true,
          distanceMultiplier: 0.001,
        },
      },
      {
        $match: filter,
      },
      {
        $project: {
          name: 1,
          categoryServices: 1,
          location: 1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/driver/NearbyDriversController.js',
      error: err?.message,
      method: 'NearbyDrivers',
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
      message: "Não foi possível listar motoristas próximos",
      err: err.message,
    });
  }
};

module.exports = NearbyDrivers;
