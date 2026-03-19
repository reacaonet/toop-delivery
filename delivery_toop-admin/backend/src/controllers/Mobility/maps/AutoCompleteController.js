const autoComplete = require("../../../services/maps/autoComplete");
const LogModel = require("../../../models/LogModel");

const geoCodeController = async (request, reply) => {
  try {
    const { address = null } = request.body || {};

    if (!address) {
      return reply.status(400).send({
        message: "Insira os dados corretamente",
      });
    }

    const geoResponse = await autoComplete(address);

    return reply.send(geoResponse);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/maps/AutoCompleteController.js",
      error: err?.message,
      method: "geoCodeController",
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
      message: "Não foi possível obter a rota",
      err: err.message,
    });
  }
};

module.exports = geoCodeController;
