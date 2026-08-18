const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../../models/UserModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    let { name, email, newPassword, confirmPassword, currentPassword } = req.body;

    let user = await User.findOne({ _id: user_id }).lean();
    if (!user) {
      return res.status(400).send({
        message: "Usuário não localizado",
      });
    }

    let passwordOK = await bcrypt.compare(currentPassword, user.password);
    if (passwordOK === false) {
      return res.status(400).send({
        message: "Senha inválida",
      });
    }

    if (!name || name.lenght < 10) {
      return res.status(400).send({
        message: "Informe um Name com pelo menos 10 caracteres",
      });
    }

    if (!email || !validator.isEmail(email)) {
      // validar email utils
      return res.status(400).send({
        message: "Informe um E-mail válido",
      });
    }

    const emailResp = await existEmail(user_id, email);
    if (emailResp) {
      return res.status(400).send({
        message: "Email já se encontra cadastrado",
      });
    }

    // gerar nova senha
    if (newPassword) {
      if (newPassword.lenght < 3) {
        return res.status(400).send({
          message: "Informe um password com pelo menos 3 caracteres",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).send({
          message: "Senha de confirmação é diferente da nova senha",
        });
      }

      newPassword = await bcrypt.hash(newPassword, 11);
    }

    let data = {
      name,
      email: `${email}`.toLowerCase(),
      password: newPassword,
    };

    const novoRegistro = await User.findOneAndUpdate(
      {
        _id: user_id,
      },
      data,
      {
        upsert: false,
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "User atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/User/ChangeController.js',
      error: dadosDoErro?.message,
      method: 'ChangeController',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      message: "Falha ao atualizar User",
      Error: dadosDoErro,
    });
  }
};

const existEmail = async (id, email) => {
  let isEmail = await User.findOne({
    _id: { $ne: id },
    email: `${email}`.toLowerCase(),
    deletedAt: {
      $exists: false,
    },
  }).lean();
  if (isEmail) {
    return true;
  }
  return false;
};
