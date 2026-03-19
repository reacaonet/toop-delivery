/** Model */
const DynamicPreRegisterModel = require("../../../models/PreRegistration/DynamicPreRegisterModel");
const LogModel = require("../../../models/LogModel");

const createDynamicController = async (request, reply) => {
  try {
    const data = request.body;

    const response = await DynamicPreRegisterModel.create(data);

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/PreRegistration/dynamic/CreateDynamicController.js',
      error: err?.message,
      method: 'createDynamicController',
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
      message: "Não foi cadastarr view",
      err: err.message,
    });
  }
};

module.exports = createDynamicController;
