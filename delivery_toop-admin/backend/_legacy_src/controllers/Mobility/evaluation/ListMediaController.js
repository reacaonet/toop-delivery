const { Types } = require("mongoose");
const moment = require("moment");
const EvaluationModel = require("../../../models/Mobility/Evaluation/EvaluationModel");
const LogModel = require("../../../models/LogModel");

const listMediaController = async (request, reply) => {
  try {
    const { rated } = request.params || {};

    let result = await EvaluationModel.aggregate([
      {
        $match: {
          idRated: new Types.ObjectId(rated),
          createdAt: {
            $gte: new Date(moment().add(-180, "days").startOf("days").format()),
            $lte: new Date(moment().endOf("days").format()),
          },
        },
      },
      {
        $group: {
          _id: "$idRated",
          totalRating: { $sum: "$stars" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          totalRating: 1,
          count: 1,
          mediaRating: { $divide: ["$totalRating", "$count"] },
        },
      },
    ]);

    if (result && Array.isArray(result)) {
      result = result.length > 0 ? result[0] : null;
    }

    return reply.send(result);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/evaluation/ListMediaController.js',
      error: err?.message,
      method: 'listMediaController',
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
      message: "Não foi possível listar avaliação",
      err: err.message,
    });
  }
};

module.exports = listMediaController;
