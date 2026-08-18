const { Types } = require("mongoose");

/** Model */
const ChosenDestinationsModel = require("../../../models/Mobility/Driver/DriverChosenDestinationsModel");
const LogModel = require("../../../models/LogModel");

const listController = async (request, reply) => {
  try {
    const { driver } = request.query;

    if (!driver || !Types.ObjectId(driver)) {
      return reply.status(400).send({
        message: "Informe um motorista válido",
      });
    }

    const response = await ChosenDestinationsModel.find({
      driver,
    }).sort({
      createdAt: -1,
    });

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/chosenDestinations/listController.js',
      error: err?.message,
      method: 'listController',
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
      message: "Não foi possível listar destinos",
      err: err.message,
    });
  }
};

module.exports = listController;
