/** Model */
const FavoritePlacesModel = require("../../../models/Mobility/Passenger/FavoritePlacesModel");
const LogModel = require("../../../models/LogModel");

const listController = async (request, reply) => {
  try {
    // const { passenger } = request.query;
    const { user } = request;

    let passengerId = null;

    if (user?.type === "person") {
      passengerId = user?.passenger;
    }

    const response = await FavoritePlacesModel.find({
      passenger: passengerId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .lean();

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/favoritePlaces/ListControllers.js',
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
      message: "Falha ao listar local favorito",
      err: err.message,
    });
  }
};

module.exports = listController;
