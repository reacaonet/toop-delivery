const { Types } = require("mongoose");

/** Model */
const IndicationModel = require("../../../models/Mobility/Indication/IndicationModel");
const LogModel = require("../../../models/LogModel");

const listController = async (request, reply) => {
  try {
    const { personReceive = null } = request.query;
    const filter = {};

    filter.personReceive = new Types.ObjectId(personReceive);

    const response = await IndicationModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "person",
          let: { person: "$person" },
          as: "person",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$person"],
                },
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                name: 1,
                image: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$person", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 40,
      },
    ]);

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/indication/ListController.js',
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
      message: "Não foi possível listar indicações",
      err: err.message,
    });
  }
};

module.exports = listController;
