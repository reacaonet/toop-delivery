const Person = require("../../models/Person/PersonModel");
const LogModel = require("../../models/LogModel");
const mongoose = require("mongoose");

const search = async (req, res) => {
  try {
    const { phone, email, id } = req.query;
    const { tokenUser, company, companies, franchise } = req;

    let filter = {};
    if (companies.length || company || franchise) {
      filter = {
        company: {
          $in: companies.length > 0 ? companies : [company],
        },
      };
    }

    let or = [];

    if (phone) {
      or.push({
        phone: phone,
      });
    }

    if (email) {
      or.push({
        email: email,
      });
    }

    if (id && mongoose.isValidObjectId(id)) {
      filter = {};
      or.push({
        _id: id,
      });
    }

    if (!or.length) {
      return res.status(400).send({
        message: "Filtro é obrigatório",
      });
    }

    filter.deletedAt = {
      $exists: false,
    };

    const list = await Person.find({
      ...filter,
      $or: or,
    }).lean();

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Person/SearchController.js',
    error: dadosDoErro?.message,
    method: 'search',
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


    console.log("dadosDoErro", dadosDoErro);
    return res.status(400).send({
      message: "Falha ao encontrar Person",
      Error: dadosDoErro.message,
    });
  }
};

module.exports = { search };
