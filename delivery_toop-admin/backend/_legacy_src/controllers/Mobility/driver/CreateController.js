const bcrypt = require("bcrypt");

/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const VehicleDocumentsDriversModel = require("../../../models/Mobility/Driver/VehicleDocumentsModel");
const LogModel = require("../../../models/LogModel");

const createController = async (request, reply) => {
  try {
    const data = request.body;

    if (data.password) {
      data.password = await bcrypt.hash(`${data.password}`.trim(), 11);
    }

    if (data.genre === "" || data.genre === null) {
      delete data.genre;
    }

    const isDriver = await DriverModel.findOne({
      $or: [
        {
          phone: data.phone,
        },
        {
          email: data.email,
        },
      ],
      deletedAt: { $exists: false },
    }).lean();

    if (isDriver && isDriver.email === data.email) {
      return reply.status(400).send({
        message: "Email já se encontra cadastrado",
      });
    }

    if (isDriver && isDriver.phone === data.phone) {
      return reply.status(400).send({
        message: "Telefone já se encontra cadastrado",
      });
    }

    const driver = await DriverModel.create(data);

    if (driver.vehicleManufacturer && driver.vehicleModel) {
      await VehicleDocumentsDriversModel.create({
        driver: driver._id,
        vehicleManufacturer: driver.vehicleManufacturer,
        vehicleModel: driver.vehicleModel,
        vehicleNameplate: driver.vehicleNameplate,
        vehicleYear: driver.vehicleYear,
        vehicleColor: driver.vehicleColor,
        carsDocument: driver.carsDocument,
        approved: true,
        status: true,
        service: driver.services && Array.isArray(driver.services) ? driver.services[0] : undefined,
      });
    }

    return reply.send({
      message: "Cadastro realizado com sucesso!",
      driver,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/driver/CreateController.js',
      error: err?.message,
      method: 'createController',
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
      message: "Não foi possível salvar motorista",
      err: err.message,
    });
  }
};

module.exports = createController;
