const SendImages = require("../../services/sendImages");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { image, folder } = req.body;

    const result = await SendImages(image, folder);

    return res.send({
      status: 200,
      message: "Imagem enviada com sucesso",
      data: result,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/SendImages/CreateController.js',
    error: dadosDoErro?.message,
    method: 'CreateController',
    type: 'error',
    level: 0,
    origin: 'backend',
    request: {
      application: req?.application,
      franchise: req?.franchise,
      company: req?.company,
      params: req?.params,
      body: req?.body,
      query: req?.query,
      heders: req?.heders,
      method: req?.method,
      url: req?.url,
    },
  });

  console.log(`Log de erro criado com sucesso.`);


    return res.status(400).send({
      message: "Falha ao enviar imagem",
      Error: dadosDoErro,
    });
  }
};
