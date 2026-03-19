const PreRegistration = require("../../models/PreRegistration/PreRegistrationModel");
const LogModel = require("../../models/LogModel");

const ListController = async (request, reply) => {
  try {
    const { phone } = request.params;
    const { ddi = null } = request.query;

    const filter = {
      phone: phone,
      status: {
        $ne: "APPROVED",
      },
    };

    if (ddi) {
      filter.ddi = ddi;
    }

    const preRegistration = await PreRegistration.findOne(filter).sort({
      createdAt: -1,
    });

    return reply.send(preRegistration);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/PreRegistration/ListController.js',
      error: err?.message,
      method: 'ListController',
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

    console.log("Error Geral", err);

    return reply.status(400).send({
      message: "Falha ao consultar pre cadastro",
      err: err.message,
    });
  }
};

module.exports = ListController;
