const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const DriversModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.franchise || !mongoose.isValidObjectId(data.franchise)) {
      return res.status(400).send({
        message: "Informe uma franquia válida",
      });
    }

    if (data.password !== data.confirmPassword) {
      return res.status(400).send({
        message: "Por favor, confirme sua senha corretamente.",
      });
    }

    if (!data.email || !validator.isEmail(data.email)) {
      // validar email utils
      return res.status(400).send({
        message: "Informe um e-mail válido",
      });
    }

    const emailResp = await existEmail(data.email);

    if (emailResp) {
      return res.status(400).send({
        message: "Email já se encontra cadastrado",
      });
    }

    // Tratar selfiePhoto
    if (!data.selfiePhoto || typeof data.selfiePhoto !== 'object') {
      return res.status(400).send({
        message: 'Imagem da Selfie inválida',
      });
    }

    const imageSelfiePhoto = [];

    if (Array.isArray(data.selfiePhoto)) {
      data.selfiePhoto.forEach((item) => imageSelfiePhoto.push(item.url));
    }

    if (imageSelfiePhoto && imageSelfiePhoto.length > 0) {
      data.selfiePhoto = imageSelfiePhoto;
    }

    const imageIdentityDocuments = [];
    if (Array.isArray(data.identityDocuments)) {
      data.identityDocuments.forEach(item => imageIdentityDocuments.push(item.url));
    }
    data.identityDocuments = imageIdentityDocuments;

    // Validate carsDocument
    if (!data.carsDocument || typeof data.carsDocument !== "object") {
      return res.status(400).send({
        message: "Imagem inválida do documento do carro",
      });
    }

    const imageCarsDocument = [];
    if (Array.isArray(data.carsDocument)) {
      data.carsDocument.forEach(item => imageCarsDocument.push(item.url));
    }
    data.carsDocument = imageCarsDocument;

    // Validate cnhDocuments
    if (!data.cnhDocuments || typeof data.cnhDocuments !== "object") {
      return res.status(400).send({
        message: "Imagem inválida do CNH",
      });
    }

    const imageCnhDocuments = [];
    if (Array.isArray(data.cnhDocuments)) {
      data.cnhDocuments.forEach(item => imageCnhDocuments.push(item.url));
    }

    data.cnhDocuments = imageCnhDocuments;

    if (data.password) {
      data.password = await bcrypt.hash(`${data.password}`.trim(), 11);
    }

    const item = await DriversModel.create(data);
    return res.send({
      status: 200,
      message: "Motorista adicionado com sucesso",
      data: item,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Drivers/CreateController.js',
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
      message: "Falha ao criar Mototorista!",
      err: err.message,
    });
  }
};

const existEmail = async email => {
  const isEmail = await DriversModel.findOne({
    email,
    deletedAt: { $exists: false },
  }).lean();

  if (isEmail) {
    return true;
  }

  return false;
};
