/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const updateLocation = async (request, reply) => {
  try {
    const { driver } = request.params;
    const {
      status,
      online,
      token,
      latitude,
      longitude,
      name,
      birthDate,
      password,
      selfiePhoto,
      cnhDocuments,
      oldPassword,
      typePaymentService,
      services,
      categoryServices,
    } = request.body || {};

    const payload = {};

    if (`${status}` === "false" || `${status}` === "true") {
      payload.status = `${status}` === "true" ? true : false;
    }

    if (`${online}` === "false" || `${online}` === "true") {
      payload.online = `${online}` === "true" ? true : false;
    }

    if (token) {
      const currentDriver = await DriverModel.findOne({ _id: driver })
        .select({
          _id: 1,
          franchise: 1,
          token: 1,
          topics: 1,
        })
        .lean();

      if (currentDriver && currentDriver._id) {
        if (
          !currentDriver.topics ||
          !Array.isArray(currentDriver.topics) ||
          currentDriver.topics.length <= 0 ||
          !currentDriver.token ||
          `${token}` !== `${currentDriver.token}`
        ) {
          //remover topicos
          await DriverModel.updateOne(
            { _id: driver },
            { $unset: { topics: 1 } }
          );
        }
      }

      payload.token = token;
    }

    if (latitude && longitude) {
      payload.location = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    if (name) {
      payload.name = name;
    }

    if (birthDate) {
      payload.birthDate = birthDate;
    }

    if (password) {
      if (`${password}`.length < 5) {
        return reply.status(400).send({
          message: "Informe uma senha com pelo menos 6 caracteres",
        });
      }

      // oldPassword -> verify old password later
      payload.password = await bcrypt.hash(password, 11);
    }

    if (selfiePhoto) {
      payload.selfiePhoto = [selfiePhoto];
    }

    if (cnhDocuments) {
      payload.cnhDocuments = [cnhDocuments];
    }

    if (typePaymentService) {
      payload.typePaymentService = typePaymentService;
    }

    if (services) {
      payload.services = services;
    }

    if (categoryServices && Array.isArray(categoryServices)) {
      payload.categoryServices = categoryServices;
    }

    if (Object.keys(payload).length <= 0) {
      return reply.status(400).send({
        message: "por favor informe as informações",
      });
    }

    await DriverModel.updateOne({ _id: driver }, payload);

    return reply.send({
      message: "posição atualizada",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/driver/UpdateLocationController.js',
      error: err?.message,
      method: 'updateLocation',
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
      message: "Não foi possível atualizar posição",
      err: err.message,
    });
  }
};

module.exports = updateLocation;
