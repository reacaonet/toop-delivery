const mongoose = require("mongoose");

const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (`${data.status}` === "true" || `${data.status}` === "false") {
      data.status = `${data.status}` === "true" ? true : false;
    }

    if (Array.isArray(data.file)) {
      data.images = [];
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images = [];
      data.images.push(data.url);
    }

    if (Array.isArray(data.maker)) {
      data.makers = [];
      data.maker.forEach(item => data.makers.push(item.url));
    } else if (data.url) {
      data.makers = [];
      data.makers.push(data.url);
    }

    if (!data.name) {
      return res.status(400).send({
        message: "Informe um Nome válido",
      });
    }

    if (!data.file || typeof data.file !== "object") {
      delete data.file;
      delete data.images;
    }
    if (!data.maker || typeof data.maker !== "object") {
      delete data.maker;
      delete data.makers;
    }

    if (data.timeZone && data.timeZone.timeZone) {
      data.utc = data.timeZone.utc;
      data.timeZone = data.timeZone.timeZone;
    } else if (data.timeZone) {
      delete data.timeZone;
    }

    const registerUpdate = await ServiceModel.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    });

    res.send({
      status: 200,
      message: "Registro atualizado com sucesso",
      data: registerUpdate,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Service/UpdateController.js',
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
      message: "Falha ao Atualizar Registro",
      Error: dadosDoErro,
    });
  }
};
