const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

const listFront = async (request, reply) => {
  try {
    const { isRoot, franchises } = request;
    const { franchiseId = null } = request.query;
    let list = [];

    const filter = {};

    if (isRoot) {
      list = await ServiceModel.find({
        franchise: franchiseId,
        deletedAt: { $exists: false },
      }).populate({
        path: "franchise",
        select: {
          name: 1,
        },
      });

      return reply.send(list);
    }

    if (!franchises || !Array.isArray(franchises) || franchises.length <= 0) {
      return reply.send([]);
    }

    filter.franchise = {
      $in: franchises,
    };

    filter.deletedAt = {
      $exists: false,
    };

    list = await ServiceModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "franchise",
          let: { franchiseId: "$franchise" },
          as: "franchise",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$franchiseId"] },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true },
      },
    ]);

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Service/listFront.js',
      error: err?.message,
      method: 'listFront',
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
      message: "Falha ao listar registro",
      err: err.message,
    });
  }
};

module.exports = listFront;
