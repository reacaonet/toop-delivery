const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const FranchiseModel = require('../../../models/Franchise/FranchiseModel');
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    data.status = (typeof data.status === 'string' && data.status === '') || data.status === null ? false : data.status;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images = [];
      data.images.push(data.url);
    }

    if (!data.file || typeof data.file !== 'object') {
      delete data.file;
      delete data.images;
    }

    // --> testa se está vindo senha para poder criptografar na edicao
    if (data.password) {
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

      data.password = await bcrypt.hash(data.password, 11);
      delete data.confirmPassword;
    }

    const registerUpdate = await FranchiseModel.findOneAndUpdate(
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
      message: 'Franquia atualizada com sucesso',
      data: registerUpdate,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Franchise/UpdateController.js',
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
      message: 'Falha ao Atualizar Franquia',
      Error: dadosDoErro,
    });
  }
};
