const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

const searchController = async (request, reply) => {
  try {
    const { search } = request.query;
    const { isRoot, franchise = null } = request;

    console.log("isRoot", isRoot);
    console.log("franchise", franchise);

    const filter = {};

    if (!isRoot || isRoot === false) {
      filter.franchise = franchise;
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      filter.name = {
        $regex: ".*" + search.toLowerCase() + ".*",
        $options: "i",
      };

      filter.deletedAt = { $exists: false };

      const list = await ServiceModel.find(filter, { name: 1, type: 1 })
        .populate({
          path: "franchise",
          select: {
            name: 1,
          },
        })
        .lean();

      return reply.send(list);
    }
    return reply.send([]);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Service/SearchController.js',
      error: err?.message,
      method: 'searchController',
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
      mesage: "Falha ao encontrar Registro",
      err: err.message,
    });
  }
};

module.exports = searchController;
