const { Types } = require("mongoose");

const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

const listController = async (request, reply) => {
  try {
    // Opcional, retorna registro único
    const id = request.params.id;

    const { name, franchise = null } = request.query;

    let list;
    const filter = {};

    if (id) {
      if (!Types.ObjectId.isValid(id)) {
        return reply.status(400).send({ message: "Id inválido" });
      }

      filter._id = new Types.ObjectId(id);
    }

    if (franchise) {
      filter.franchise = franchise;
    }

    // --> name filter
    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = {
        $regex: ".*" + decodeName.toLowerCase() + ".*",
        $options: "i",
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (filter._id) {
      list = await ServiceModel.findOne(filter).populate("franchise");
    } else {
      list = await ServiceModel.find(filter);
    }

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Service/ListController.js',
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
      message: "Falha ao encontrar Registro",
      err: err.message,
    });
  }
};

module.exports = listController;
