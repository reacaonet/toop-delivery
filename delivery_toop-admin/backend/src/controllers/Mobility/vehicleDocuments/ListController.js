const { Types } = require("mongoose");
const VehicleDocumentsDriversModel = require("../../../models/Mobility/Driver/VehicleDocumentsModel");
const LogModel = require("../../../models/LogModel");

const list = async (request, reply) => {
  try {
    const { driver } = request.params;
    const { approved = "", status = "" } = request.query;

    const filter = {};

    filter.driver = new Types.ObjectId(driver);

    if (`${approved}` === "true" || `${approved}` === "false") {
      filter.approved = `${approved}` === "true" ? true : false;
    }

    if (`${status}` === "true" || `${status}` === "false") {
      filter.status = `${status}` === "true" ? true : false;
    }

    const data = await VehicleDocumentsDriversModel.find(filter);

    return reply.status(200).send(data);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/vehicleDocuments/ListController.js',
      error: err?.message,
      method: 'list',
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
      message: err.message,
    });
  }
};

module.exports = { list };
