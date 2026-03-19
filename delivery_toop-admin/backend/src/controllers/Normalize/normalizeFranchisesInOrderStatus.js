const mongoose = require("mongoose");

const CompanyModel = require("../../models/Company/CompanyModel");
const OrderStatus = require("../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../models/LogModel");

const { getCoordinate } = require("../../utils");

/**
 * Url - /normalize/franchise-in-orders
 */
const normalizeFranchisesInOrderStatus = async (req, res) => {
  try {
    const companies = await CompanyModel.find({}).lean();

    for await (const company of companies) {
      console.log("Company _id: ", company._id);
      console.log("Franchise _id: ", company.franchise);

      await OrderStatus.updateMany({ company: mongoose.Types.ObjectId(company._id) }, { franchise: company.franchise });

      console.log("+++++++++++++++++++++++++++++++++++++++++");
    }

    return res.status(200).send({
      message: "sucesso",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Normalize/normalizeFranchisesInOrderStatus.js',
      error: err?.message,
      method: 'normalizeFranchisesInOrderStatus',
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

module.exports = normalizeFranchisesInOrderStatus;
