/** Model */
const TimeZoneModel = require("../../../models/Setting/TimeZoneModel");
const LogModel = require("../../../models/LogModel");

const listController = async (request, reply) => {
  try {
    const response = await TimeZoneModel.find()
      .sort({
        offset: -1,
      })
      .lean();

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Setting/timeZone/ListController.js',
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
      message: "Falha ao listar TimeZone",
      err: err.message,
    });
  }
};

module.exports = listController;
