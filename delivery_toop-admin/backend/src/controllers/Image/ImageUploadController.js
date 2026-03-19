const LogModel = require("../../models/LogModel");

const uploadFile = async (request, reply) => {
  try {
    // console.log(request.body.file[0].url);
    return reply.send({
      status: 200,
      status: "success",
      url: request.body.file[0].url,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Image/ImageUploadController.js',
      error: err?.message,
      method: 'uploadFile',
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

    console.log(`Error in image upload => ${err}`);

    return res.status(400).send({
      message: err.message,
    });
  }
};

module.exports = uploadFile;
