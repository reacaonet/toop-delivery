/** Model */
const TypePaymentServiceModel = require("../../../models/Mobility/Payment/typePaymentServiceModel");
const LogModel = require("../../../models/LogModel");

const listTypePaymentService = async (request, reply) => {
  try {
    const list = await TypePaymentServiceModel.find({
      status: true,
    });

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/typePaymentService/listTypePaymentController.js',
      error: err?.message,
      method: 'listTypePaymentService',
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
      message: "Não foi possível listar",
      err: err.message,
    });
  }
};

module.exports = listTypePaymentService;
