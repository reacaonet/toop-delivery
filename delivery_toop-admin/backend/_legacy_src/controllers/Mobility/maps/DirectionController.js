const { directions } = require("../../../services/maps/directions");
const LogModel = require("../../../models/LogModel");

const distanceController = async (request, reply) => {
  try {
    const { passengerId = null, driverId = null, origin, destiny, additionalStops = null } = request.body || {};

    if (!passengerId && !driverId) {
      return reply.status(400).send({
        message: "Não foi possível obter a rota",
      });
    }

    if (!origin) {
      return reply.status(400).send({
        message: "Informe o endereço de origem",
      });
    }

    if (!destiny) {
      return reply.status(400).send({
        message: "Informe o endereço de destino",
      });
    }

    let waypoints = "";

    if (additionalStops && `${additionalStops}`.length > 5) {
      waypoints = `${additionalStops}`.replace(/\|$/, "");
    }

    const response = await directions(origin, destiny, waypoints);

    if (response && response.status === 400) {
      return reply.status(400).send({
        message: response.message,
      });
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/maps/DirectionController.js',
      error: err?.message,
      method: 'distanceController',
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
      message: "Não foi possível obter a rota",
      err: err.message,
    });
  }
};

module.exports = distanceController;
