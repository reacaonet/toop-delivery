const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const DriversModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");
const database = require("../../../services/firebase");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (`${data.status}` === "true" || `${data.status}` === "false") {
      data.status = `${data.status}` === "true" ? true : false;
    }

    if (!data.franchise || !mongoose.isValidObjectId(data.franchise)) {
      return res.status(400).send({
        message: "Informe uma franquia válida",
      });
    }

    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
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

    const emailResp = await existEmail(id, data.email);

    if (emailResp) {
      return res.status(400).send({
        message: "Email já se encontra cadastrado",
      });
    }

    // Tratar selfiaePhoto
    const imageSelfiePhoto = [];

    if (
      Array.isArray(data.selfiePhoto) &&
      typeof data.selfiePhoto[0] === 'object'
    ) {
      data.selfiePhoto.forEach((item) => imageSelfiePhoto.push(item.url));
      data.selfiePhoto = imageSelfiePhoto;
    } else {
      delete data.selfiePhoto;
    }

    // Tratar identityDocuments
    const imageIdentityDocuments = [];

    if (
      Array.isArray(data.identityDocuments) &&
      typeof data.identityDocuments[0] === 'object'
    ) {
      data.identityDocuments.forEach((item) =>
        imageIdentityDocuments.push(item.url),
      );
      data.identityDocuments = imageIdentityDocuments;
    } else {
      delete data.identityDocuments;
    }
    //  Validate carsDocument
    const imageCarsDocument = [];

    if (
      Array.isArray(data.carsDocument) &&
      typeof data.carsDocument[0] === 'object'
    ) {
      data.carsDocument.forEach((item) => imageCarsDocument.push(item.url));
      data.carsDocument = imageCarsDocument;
    } else {
      delete data.carsDocument;
    }

    // Validate cnhDocuments
    const imageCnhDocuments = [];

    if (
      Array.isArray(data.cnhDocuments) &&
      typeof data.cnhDocuments[0] === 'object'
    ) {
      data.cnhDocuments.forEach((item) => imageCnhDocuments.push(item.url));
      data.cnhDocuments = imageCnhDocuments;
    } else {
      delete data.cnhDocuments;
    }

    if (data.password) {
      data.password = await bcrypt.hash(`${data.password}`.trim(), 11);
    } else {
      try {
        delete data.password;
      } catch (err) {
        await LogModel.create({
          path: '',
          error: err?.message,
          method: '',
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
      }
    }

    if (`${data.block}` === "true" || `${data.block}` === "false") {
      data.block = `${data.block}` === "true" ? true : false;

      if (`${data.block}` === "true") {
        await database.ref().child(`${process.env.FIREBASE_PATH}driver/${id}`).set({
          type: "block",
          message: "Seu Cadastro se encontra inativo, para mais detalhes entre em contato com o suporte",
        });
      }
    }

    const driverUpdate = await DriversModel.findOneAndUpdate({ _id: id }, data, {
      upsert: true,
      new: true,
    });

    res.send({
      status: 200,
      message: "Registro atualizado com sucesso",
      data: driverUpdate,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Drivers/UpdateController.js',
      error: err?.message,
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
      err: err.message,
    });
  }
};

const existEmail = async (id, email) => {
  const isEmail = await DriversModel.findOne({
    _id: { $ne: id },
    email: `${email}`.toLowerCase(),
    deletedAt: { $exists: false },
  }).lean();

  if (isEmail) {
    return true;
  }

  return false;
};
