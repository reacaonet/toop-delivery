/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const listLocationCurrent = async (request, reply) => {
  try {
    const { driver } = request.params;

    const current = await DriverModel.findById(driver)
      .select({
        location: -1,
      })
      .lean();

    if (
      current &&
      current.location &&
      current.location.coordinates &&
      Array.isArray(current.location.coordinates) &&
      current.location.coordinates.length === 2
    ) {
      const latitude = current.location.coordinates[1];
      const longitude = current.location.coordinates[0];

      return reply.send({
        latitude,
        longitude,
      });
    }

    return reply.send(null);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/driver/listLocationCurrent.js',
      error: err?.message,
      method: 'listLocationCurrent',
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
      message: "Não foi possível localizar posição",
      err: err.message,
    });
  }
};

module.exports = listLocationCurrent;
