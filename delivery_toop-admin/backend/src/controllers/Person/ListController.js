const mongoose = require("mongoose");
const Person = require("../../models/Person/PersonModel");
const UserPerson = require("../../models/UserModel");
const LogModel = require("../../models/LogModel");

const list = async (req, res) => {
  try {
    const { id, type } = req.query;
    const { tokenUser, isFranchise, company, companies, franchise } = req;

    if (!id && !type) {
      res.status(200).send();
    }

    let filter = {};
    if (isFranchise) {
      if (companies.length <= 0 && !company) return res.status(200).send([]);
      filter = {
        company: {
          $in: companies.length > 0 ? companies : [company],
        },
      };
    }

    if (type === "shopper") {
      filter.shopper = id;
    }

    filter.deletedAt = {
      $exists: false,
    };

    const person = await Person.find(filter).populate("city");

    return res.status(200).send(person);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/ListController.js',
      error: err?.message,
      method: 'list',
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
      message: err.message,
    });
  }
};

const listOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    let filter = {};
    let person = {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        message: "Usuário inválido",
      });
    }

    if (!type) {
      return res.status(400).send({
        message: "Informe um tipo de Person válido",
      });
    }

    // if (type === "shopper") {
    //   person = await Person.findOne({
    //     shopper: id,
    //   }).populate("shopper");
    // }

    // if (type === "deliveryMan") {
    //   person = await Person.findOne({
    //     deliveryMan: id,
    //   }).populate("deliveryMan");
    // }

    person = await UserPerson.findById(id).populate("person");
    return res.status(200).send(person);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/ListController.js',
      error: err?.message,
      method: 'listOne',
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
      message: err.message,
    });
  }
};

module.exports = {
  list,
  listOne,
};
