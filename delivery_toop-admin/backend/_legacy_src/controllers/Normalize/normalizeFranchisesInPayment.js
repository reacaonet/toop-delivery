const mongoose = require("mongoose");

const CompanyModel = require("../../models/Company/CompanyModel");
const PaymentModel = require("../../models/Shopping/PaymentModel");
const LogModel = require("../../models/LogModel");

const { getCoordinate } = require("../../utils");

/**
 * Url - /normalize/franchise-in-paymnets
 */
const normalizeFranchisesInPayment = async (req, res) => {
  try {
    const companies = await CompanyModel.find({}).lean();

    for await (const company of companies) {
      console.log("Company _id: ", company._id);
      console.log("Franchise _id: ", company.franchise);

      await PaymentModel.updateMany({ company: mongoose.Types.ObjectId(company._id) }, { franchise: company.franchise });

      console.log("+++++++++++++++++++++++++++++++++++++++++");
    }

    return res.status(200).send({
      message: "sucesso",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Normalize/normalizeFranchisesInPayment.js',
      error: err?.message,
      method: 'normalizeFranchisesInPayment',
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

    console.log("err", err);
    return res.status(400).send({
      message: "Não foi possível normalizar",
    });
  }
};

module.exports = normalizeFranchisesInPayment;
