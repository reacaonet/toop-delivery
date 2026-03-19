const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const listForName = async (request, reply) => {
  try {
    const listPorNome = request.query.listPorNome;
    const { franchise } = request;

    // restringe por nivel de empresa/fraquia
    let filter = {};
    let list;

    filter.deletedAt = {
      $exists: false,
    };

    // restringe por nivel de empresa/fraquia
    if (franchise) {
      filter = {
        franchise: franchise,
      };
    }

    filter.status = true;
    filter.block = { $ne: true };

    if (listPorNome && typeof listPorNome === "string") {
      list = await DriverModel.find({
        ...filter,
        name: {
          $regex: ".*" + listPorNome.toLowerCase() + ".*",
          $options: "i",
        },
      })
        .select({
          name: 1,
          token: 1,
          email: 1,
          phone: 1,
          location: 1,
          franchise: 1,
        })
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
      path: "src/controllers/Mobility/driver/ListPorNomeController.js",
      error: err?.message,
      method: "listForName",
      type: "error",
      level: 0,
      origin: "backend",
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

    return reply.status(400).send({
      mesage: "Falha ao encontrar Driver",
      err: err.message,
    });
  }
};

module.exports = listForName;
