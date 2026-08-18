/** Model */
const ChosenDestinationsModel = require('../../../models/Mobility/Driver/DriverChosenDestinationsModel');
const LogModel = require("../../../models/LogModel");

const updateController = async (request, reply) => {
  try {
    const { driver, id } = request.params;
    const data = request.body;

    const isItem = await ChosenDestinationsModel.findOne({
      _id: id,
      driver: driver,
    }).select({
      _id: 1,
    });

    if (!isItem) {
      return reply.status(400).send({
        message: 'Informe um destino válido',
      });
    }

    await ChosenDestinationsModel.updateOne(
      {
        _id: id,
      },
      data,
    );

    return reply.send({
      message: 'Atualizado com sucesso!',
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/chosenDestinations/updateController.js',
      error: err?.message,
      method: 'updateController',
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
      message: 'Não foi possível atualizar destino',
      err: err.message,
    });
  }
};

module.exports = updateController;
