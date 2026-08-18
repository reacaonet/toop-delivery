/** Model */
const FavoriteDriversModel = require("../../../models/Mobility/Driver/FavoriteDriversModel");
const LogModel = require("../../../models/LogModel");

const isFavorite = async (request, reply) => {
  try {
    const { driver, passenger } = request.params;

    const favorite = await FavoriteDriversModel.findOne({
      driver,
      passenger,
    }).lean();

    return reply.send(favorite);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/favoriteDriver/isFavoriteController.js',
      error: err?.message,
      method: 'isFavorite',
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
      message: "Não foi possível verificar",
      err: err.message,
    });
  }
};

module.exports = isFavorite;
