const mongoose = require("mongoose");
const Slider = require("../../../models/Mobility/Slider/sliderModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

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
    } else if (data.url) {
      data.image = [];
      data.image.push(data.url);
    }

    if (!data.file || typeof data.file !== "object") {
      delete data.file;
      delete data.image;
    }

    const novoRegistro = await Slider.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: true,
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "Slider atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Slider/UpdateController.js',
    error: dadosDoErro?.message,
    method: 'UpdateController',
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
      message: "Falha ao atualizar Slider",
      Error: dadosDoErro,
    });
  }
};
