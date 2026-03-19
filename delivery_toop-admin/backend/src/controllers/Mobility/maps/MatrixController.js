/** Service */
const matrix = require("../../../services/maps/distancematrix");

const LogModel = require("../../../models/LogModel");

const matrixController = async (request, reply) => {
  try {
    const { passengerId = null, driverId = null, origin, destiny } = request.body || {};

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

    const response = await matrix(origin, destiny, {});
    // console.log('response', response);

    if (response && response.status === 400) {
      return reply.status(400).send({
        message: response.message,
      });
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/maps/MatrixController.js',
      error: err?.message,
      method: 'matrixController',
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

module.exports = matrixController;
