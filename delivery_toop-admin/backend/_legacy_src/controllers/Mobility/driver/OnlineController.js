const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const onlineController = async (request, reply) => {
  try {
    const { driverId } = request.params;
    const { status } = request.body;

    let online = true;

    if (`${status}` === "false") {
      online = false;
    }

    await DriverModel.updateOne(
      { _id: driverId },
      {
        online,
      },
    );

    const driver = await DriverModel.findById(driverId).lean();

    return reply.send(driver);
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Mobility/driver/OnlineController.js',
    error: err?.message,
    method: 'onlineController',
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
      message: "Não foi possível modificar status",
      err: err.message,
    });
  }
};

module.exports = onlineController;
