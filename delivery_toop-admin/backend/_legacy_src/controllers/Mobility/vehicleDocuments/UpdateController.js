const VehicleDocumentsDriversModel = require("../../../models/Mobility/Driver/VehicleDocumentsModel");
const LogModel = require("../../../models/LogModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");

const updateController = async (request, reply) => {
  try {
    const { id } = request.params;
    const data = request.body || {};

    if (`${data.status}` === "true" || `${data.status}` === "false") {
      data.status = `${data.status}` === "true" ? true : false;
    }

    if (`${data.approved}` === "true" || `${data.approved}` === "false") {
      data.approved = `${data.approved}` === "true" ? true : false;
    }

    await VehicleDocumentsDriversModel.updateOne(
      {
        _id: id,
      },
      data,
    );

    const response = await VehicleDocumentsDriversModel.findById(id).lean();

    // Veículo Principal
    if (`${data.status}` === "true") {
      await DriverModel.updateOne(
        {
          _id: response.driver.toString(),
        },
        {
          vehicleManufacturer: response.vehicleManufacturer,
          vehicleModel: response.vehicleModel,
          vehicleNameplate: response.vehicleNameplate,
          vehicleYear: response.vehicleYear,
          vehicleColor: response.vehicleColor,
        },
      );

      await VehicleDocumentsDriversModel.updateMany(
        {
          _id: { $ne: id },
          driver: response.driver
        },
        {
          status: false,
        },
      );
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/vehicleDocuments/UpdateController.js',
      error: err?.message,
      method: 'updateController',
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

module.exports = updateController;
