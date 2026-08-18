/** Model */
const ChosenDestinationsModel = require("../../../models/Mobility/Driver/DriverChosenDestinationsModel");
const LogModel = require("../../../models/LogModel");

const createController = async (request, reply) => {
  try {
    const data = request.body;

    data.location = {
      type: "Point",
      coordinates: [Number(data.longitude), Number(data.latitude)],
      address: data.address,
    };

    const item = await ChosenDestinationsModel.create(data);

    return reply.send(item);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/chosenDestinations/createController.js',
      error: err?.message,
      method: 'createController',
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
      message: "Não foi possível criar destino",
      err: err.message,
    });
  }
};

module.exports = createController;
