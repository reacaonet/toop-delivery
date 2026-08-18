const mongoose = require("mongoose");

const Slider = require("../../../models/Mobility/Slider/sliderModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.file || typeof data.file !== "object") {
      return res.status(400).send({
        message: "Imagens inválidas",
      });
    }

    if (`${data.status}` === "true" || `${data.status}` === "false") {
      data.status = `${data.status}` === "true" ? true : false;
    }

    if (!data.franchise || !mongoose.isValidObjectId(data.franchise)) {
      return reply.status(400).send({
        message: "Informe uma franquia válida",
      });
    }

    data.image = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.image.push(item.url));
    } else if (file.url) {
      data.image.push(file.url);
    }

    const slider = await Slider.create(data);

    return res.send({
      status: 200,
      message: "Slider criada com sucesso",
      data: slider,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Slider/CreateController.js',
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
      message: "Falha ao criar Slider",
      error: dadosDoErro,
    });
  }
};
