const mongoose = require("mongoose");

const CompanyDelivery = require("../../models/Company/CompanyDeliveryModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const company = req.params.company;

    let data = {};

    //Quando o ID não for obrigatóriio
    if (company && !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Id da empresa inválido!",
      });
    }

    if (company && mongoose.Types.ObjectId.isValid(company)) {
      data.company = company;
    }

    data.deletedAt = {
      $exists: false,
    };

    const list = await CompanyDelivery.find(data).populate("company", { name: 1 }).lean();
    return res.json(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/CompanyDelivery/ListController.js',
      error: err?.message,
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
      message: "Falha ao encontrar Empresa",
      Error: err.message,
    });
  }
};
