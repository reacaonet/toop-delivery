const sendFile = require("./sendFiles");
const LogModel = require("../../../models/LogModel");

const fileController = async (request, reply) => {
  try {
    const { folder } = request.body || {};

    if (!folder || !request.file_path || !request.file_name) {
      return reply.status(400).send({
        message: "Falha ao enviar file",
        err: "arquivo não localizado",
      });
    }

    const result = await sendFile(request.file_path, request.file_name, folder);

    if (!result) {
      return reply.status(400).send({
        message: "Não foi possível enviar arquivo",
      });
    }

    return reply.send({
      message: "Arquivo enviada com sucesso",
      url: result,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/upload/FileController.js',
      error: err?.message,
      method: 'FileController',
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

    console.log("oops fail", err);

    return reply.status(400).send({
      message: "Não conseguimos processar solicitação",
      err: err.message,
    });
  }
};

module.exports = fileController;
