const mongoose = require("mongoose");

const CompanyModel = require("../../../models/Company/CompanyModel");
const IntegrationsModel = require("../../../models/tools/IntegrationsModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { name } = req.query;
    // const { company, companies = [] } = req;

    let filter = {};

    filter.deletedAt = {
      $exists: false,
    };

    if (name && typeof name === "string" && name.trim().length > 0) {
      let filterCompany = {
        name: { $regex: ".*" + name.toLowerCase() + ".*", $options: "i" },
      };

      const comp = await CompanyModel.find(filterCompany, { _id: 1 });
      if (comp && comp.length > 0) {
        filter.company = {
          $in: comp,
        };
      }
    }

    const list = await IntegrationsModel.find(filter).populate("company", {
      name: 1,
    });

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Tools/Integrations/ListController.js',
    error: dadosDoErro?.message,
    method: 'ListController',
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
      message: "Falha ao encontrar Integração",
      Error: dadosDoErro,
    });
  }
};
