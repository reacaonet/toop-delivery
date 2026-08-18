const { Types } = require("mongoose");
const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

const paginatorController = async (request, reply) => {
  try {
    const { pageIn = 0, pageOut = 20, name, franchiseId } = request.query;
    const { isRoot, franchise } = request;

    const filter = {};
    let list;

    if (!isRoot) {
      filter.franchise = new Types.ObjectId(franchise);
    }

    if (Types.ObjectId.isValid(franchiseId)) {
      filter.franchise = new Types.ObjectId(franchiseId);
    }

    if (Number(pageIn) < 0 || Number(pageOut) < 0) {
      return reply.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    // --> name filter
    if (name && typeof name === "string" && name.trim().length > 0) {
      filter.name = { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" };
    }

    // --> not deleted
    filter.deletedAt = {
      $exists: false,
    };

    list = await ServiceModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "franchise",
          localField: "franchise",
          foreignField: "_id",
          as: "franchise",
        },
      },
      // {
      //   $lookup: {
      //     from: 'priceCalculations',
      //     localField: 'priceCalculation',
      //     foreignField: '_id',
      //     as: 'priceCalculation',
      //   },
      // },
      {
        $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true },
      },
      // {
      //   $unwind: {
      //     path: '$priceCalculation',
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      { $skip: parseInt(pageIn, 10) * parseInt(pageOut, 10) },
      { $limit: parseInt(pageOut, 10) },
    ]);

    const numTotal = await ServiceModel.countDocuments(filter);

    return reply.send({ list, total: numTotal });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Service/PaginatorController.js',
    error: err?.message,
    method: 'paginatorController',
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
      message: "Falha ao encontrar registros para Paginação",
      err: err.message,
    });
  }
};

module.exports = paginatorController;
