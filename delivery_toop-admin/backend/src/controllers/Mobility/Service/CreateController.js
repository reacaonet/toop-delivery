const mongoose = require("mongoose");

const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;

    // Trata status
    data.status = true;

    data.images = [];

    if (data._id || data._id === "") {
      delete data._id;
    }

    if (data.timeZone && data.timeZone.timeZone) {
      data.utc = data.timeZone.utc;
      data.timeZone = data.timeZone.timeZone;
    } else if (data.timeZone) {
      delete data.timeZone;
    }

    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }

    data.makers = [];
    if (Array.isArray(data.maker)) {
      await data.maker.forEach(item => data.makers.push(item.url));
    } else if (data.maker.url) {
      data.makers.push(data.maker.url);
    }

    if (!data.name) {
      return res.status(400).send({
        message: "Informe um Nome válido",
      });
    }

    const service = await ServiceModel.create(data);

    return res.send({
      status: 200,
      message: "Registro adiconado com sucesso",
      data: service,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Service/CreateController.js',
      error: err?.message,
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
      message: "Falha ao criar Registro",
      err: err.message,
    });
  }
};
