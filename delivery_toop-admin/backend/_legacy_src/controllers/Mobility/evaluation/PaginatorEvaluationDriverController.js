const { Types } = require("mongoose");
const EvaluationModel = require("../../../models/Mobility/Evaluation/EvaluationModel");
const LogModel = require("../../../models/LogModel");

const evaluationPassenger = async (request, reply) => {
  try {
    const { pageIn = 1, pageOut = 20, limit = 20, driver, passenger } = request.query;
    const { isRoot, franchise } = request;

    const filter = {
      typeEvaluator: "driver",
      typeRated: "passenger",
    };

    const filterDriver = {};

    if (!isRoot) {
      filterDriver["driver.franchise"] = new Types.ObjectId(franchise);
    }

    if (driver) {
      filterDriver["driver._id"] = new Types.ObjectId(driver);
    }

    if (passenger) {
      filterDriver["passenger._id"] = new Types.ObjectId(passenger);
    }

    const respose = await EvaluationModel.aggregate([
      {
        $match: filter,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "passenger",
          let: { id: "$idRated" },
          as: "passenger",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $project: {
                person: 1,
              },
            },
            { $limit: 1 },
            {
              $lookup: {
                from: "person",
                let: { id: "$person" },
                as: "person",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      phone: 1,
                      email: 1,
                    },
                  },
                  {
                    $limit: 1,
                  },
                ],
              },
            },
            {
              $unwind: { path: "$person", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $unwind: { path: "$passenger", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "driver",
          let: { id: "$idEvaluator" },
          as: "driver",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$driver", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filterDriver,
      },
      {
        $skip: (parseInt(pageIn) - 1) * parseInt(pageOut),
      },
      {
        $limit: limit,
      },
    ]);

    let total = 0;
    total = await EvaluationModel.countDocuments(filter);

    return reply.send({
      list: respose,
      total: total,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/evaluation/PaginatorEvaluationDriverController.js',
      error: err?.message,
      method: 'evaluationPassenger',
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

module.exports = evaluationPassenger;
