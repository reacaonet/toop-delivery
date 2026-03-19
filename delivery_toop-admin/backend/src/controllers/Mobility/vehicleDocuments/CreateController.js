const VehicleDocumentsDriversModel = require("../../../models/Mobility/Driver/VehicleDocumentsModel");
const LogModel = require("../../../models/LogModel");

const createController = async (request, reply) => {
  try {
    const data = request.body || {};

    const response = await VehicleDocumentsDriversModel.create(data);

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/vehicleDocuments/CreateController.js",
      error: err?.message,
      method: "createController",
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

    return reply.send(400).send({
      message: err.message,
    });
  }
};

module.exports = createController;
