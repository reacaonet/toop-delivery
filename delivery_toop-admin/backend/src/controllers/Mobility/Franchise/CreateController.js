const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const validator = require('validator');
const FranchiseModel = require('../../../models/Franchise/FranchiseModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    // Trata status
    data.status = true;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }

    if (!data.password || data.password.lenght < 6) {
      return res.status(400).send({
        message: 'Informe um password com pelo menos 6 caracteres',
      });
    }

    if (data.password !== data.confirmPassword) {
      return res.status(400).send({
        message: 'Password de confirmação é diferente do password',
      });
    }

    if (!data.email || !validator.isEmail(data.email)) {
      // validar email utils
      return res.status(400).send({
        message: 'Informe um E-mail válido',
      });
    }

    const emailResp = await existEmail(data.email);
    if (emailResp) {
      return res.status(400).send({
        message: 'Email já se encontra cadastrado',
      });
    }

    data.password = await bcrypt.hash(data.password, 11);
    delete data.confirmPassword;

    const franchise = await FranchiseModel.create(data);

    return res.send({
      status: 200,
      message: 'Franquia criada com sucesso',
      data: franchise,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Franchise/CreateController.js',
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
      message: 'Falha ao criar Franquia',
      Error: dadosDoErro,
    });
  }
};

const existEmail = async email => {
  let isEmail = await FranchiseModel.findOne({ email }).lean();
  if (isEmail) {
    return true;
  }
  return false;
};
