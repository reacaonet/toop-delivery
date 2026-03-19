const Slider = require('../../models/SliderModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const slider = await Slider.create(req.body);

    return res.send({ slider });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Slider/RegisterController.js',
      error: dadosDoErro?.message,
      method: 'RegisterController',
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
      message: "Falha ao registrar Slider",
      Error: dadosDoErro
    });
  }
};