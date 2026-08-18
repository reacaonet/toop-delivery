const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../../models/UserModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    //const data = req.body;

    let { person, name, email, password, confirmPassword, company, franchise, companies, franchises } = req.body;

    if (!person || !mongoose.isValidObjectId(person)) {
      return res.status(400).send({
        message: "Informe um Person válido",
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

    const emailResp = await existEmail(id, email);
    if (emailResp) {
      return res.status(400).send({
        message: "Email já se encontra cadastrado",
      });
    }

    // gerar nova senha
    if (password) {
      if (password.lenght < 6) {
        return res.status(400).send({
          message: "Informe um password com pelo menos 6 caracteres",
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).send({
          message: "Password de confirmação é diferente do password",
        });
      }

      password = await bcrypt.hash(password, 11);
    }

    const companiesList = [];
    if (companies && Array.isArray(companies) && companies.length > 0) {
      company = company ? company : companies[0].companies._id;

      for await (const com of companies) {
        if (com.companies) {
          companiesList.push(com.companies);
        }
      }
    }

    const franchisesList = [];
    if (franchises && Array.isArray(franchises) && franchises.length > 0) {
      franchise = franchise ? franchise : franchises[0].franchises._id;
      for await (const franchise of franchises) {
        if (franchise.franchises) {
          franchisesList.push(franchise.franchises);
        }
      }
    }

    let data = {
      person,
      name,
      email: `${email}`.toLowerCase(),
      companies: companiesList,
      franchises: franchisesList,
    };

    if (franchise) {
      data.franchise = franchise;
    }

    if (company) {
      data.company = company;
    }
    if (password) {
      data.password = password;
    }

    const novoRegistro = await User.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: false,
        new: true,
      },
    )
      .populate("company")
      .populate("person");

    res.send({
      status: 200,
      message: "User atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/User/UpdateController.js',
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
