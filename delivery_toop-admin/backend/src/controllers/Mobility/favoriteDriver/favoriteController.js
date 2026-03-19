/** Model */
const FavoriteDriversModel = require("../../../models/Mobility/Driver/FavoriteDriversModel");
const LogModel = require("../../../models/LogModel");

const favorite = async (request, reply) => {
  try {
    const { driver, passenger } = request.body;

    const isFavorite = await FavoriteDriversModel.findOne({
      driver,
      passenger,
    }).lean();

    if (isFavorite && isFavorite._id) {
      await FavoriteDriversModel.deleteOne({
        driver,
        passenger,
      });

      return reply.send(null);
    }

    const response = await FavoriteDriversModel.create({
      driver,
      passenger,
    });

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/favoriteDriver/favoriteController.js',
      error: err?.message,
      method: 'favorite',
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
      message: "Não foi possível favoritar motorista",
      err: err.message,
    });
  }
};

module.exports = favorite;
