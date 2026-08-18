const Company = require("../../models/Company/CompanyModel");
const LogModel = require('../../models/LogModel');
const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    const search = req.query.search;
    const { franchise } = req.query;
    const { isRoot, tokenUser, company, companies = [] } = req;

    let filter = {};
    if ((isRoot === false && companies.length) || company) {
      filter = {
        _id: {
          $in: companies && companies.length > 0 ? companies : [company],
        },
      };
    } else if (isRoot === false) {
      filter = {
        _id: {
          $in: [],
        },
      };
    }

    if (franchise && franchise != "") {
      filter = {
        franchise: franchise,
      };
    }

    if (search && typeof search === "string") {
      list = await Company.find(
        {
          ...filter,
          name: { $regex: ".*" + search.toLowerCase() + ".*", $options: "i" },
          deletedAt: {
            $exists: false,
          },
        },
        { name: 1, type: 1 },
      );
      return res.json(list);
    } else {
      return res.json([]);
    }
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/SearchController.js',
    error: dadosDoErro?.message,
    method: 'SearchController',
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
      mesage: "Falha ao encontrar Company",
      error: dadosDoErro.message,
    });
  }
};
