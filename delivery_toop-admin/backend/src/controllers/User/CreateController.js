const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const User = require("../../models/UserModel");
const CompanyModel = require("../../models/Company/CompanyModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { isFranchise, franchise: franchiseLogged } = req;

    let { person, name, email, password, confirmPassword, companies, franchise, company, type, franchises } = req.body;

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

    if (!password || password.lenght < 6) {
      return res.status(400).send({
        message: "Informe um password com pelo menos 6 caracteres",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).send({
        message: "Password de confirmação é diferente do password",
      });
    }

    const emailResp = await existEmail(email);
    if (emailResp) {
      return res.status(400).send({
        message: "Email já se encontra cadastrado",
      });
    }

    const companiesList = [];
    if (companies && Array.isArray(companies) && companies.length > 0) {
      company = companies[0].companies._id;

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

    if (isFranchise) franchise = franchiseLogged;

    let newUser = new User({
      person,
      name,
      email: `${email}`.toLowerCase(),
      password,
      type,
      company,
      franchise,
      companies: companiesList,
      franchises: franchisesList,
    });

    newUser.password = await bcrypt.hash(password, 11);
    let user = await newUser.save();
    user = await user.populate("company").populate("person").execPopulate();

    //let user = await User.create(data);
    //user = await user.populate('company').populate('person').execPopulate();

    return res.send({
      status: 200,
      message: "user criada com sucesso",
      data: user,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/User/CreateController.js',
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


    console.log("Error Geral", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao criar user",
      Error: dadosDoErro.message,
    });
  }
};

const existEmail = async email => {
  let isEmail = await User.findOne({
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
