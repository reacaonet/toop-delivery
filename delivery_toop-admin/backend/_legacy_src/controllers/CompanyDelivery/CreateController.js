const mongoose = require("mongoose");

const CompanyDeliveryModel = require("../../models/Company/CompanyDeliveryModel");
const CompanyModel = require("../../models/Company/CompanyModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { isCompany, isFranchise, isRoot } = req;
    const { company } = req.params;
    const data = req.body;
    const filter = {
      deletedAt: { $exists: false },
    };

    //Quando o ID é obrigatório
    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Id da empresa inválido!",
      });
    }

    data.isOpen = (typeof data.isOpen === "string" && data.isOpen === "") || data.isOpen === null ? false : data.isOpen;

    data.own_delivery = (typeof data.own_delivery === "string" && data.own_delivery === "") || data.own_delivery === null ? false : data.own_delivery;
    data.online_delivery =
      (typeof data.online_delivery === "string" && data.online_delivery === "") || data.online_delivery === null ? false : data.online_delivery;

    data.withdrawMarket = (typeof data.withdrawMarket === "string" && data.withdrawMarket === "") || data.withdrawMarket === null ? false : data.withdrawMarket;

    // trata as informações do frete gratis
    if (data.shippingInfo) {
      if (`${data.shippingInfo.freeShipping}` === "true") {
        data.shippingInfo.activatedBy = isCompany ? "company" : isFranchise ? "franchise" : isRoot ? "root" : "";
      }
    }

    data.has_split = (typeof data.has_split === "string" && data.has_split === "") || data.has_split === null ? false : data.has_split;

    data.company = company;

    filter.company = company;
    let companyDelivery = null;

    const isCompanyDelivery = await CompanyDeliveryModel.findOne(filter).lean();

    if (isCompanyDelivery && isCompanyDelivery._id) {
      delete data._id;
      await CompanyDeliveryModel.updateOne({ company }, data);
      companyDelivery = await CompanyDeliveryModel.findOne(filter).lean();
    } else {
      delete data._id;
      data.company = company;
      companyDelivery = await CompanyDeliveryModel.create(data);
    }

    if (companyDelivery && companyDelivery._id) {
      await CompanyModel.updateOne(
        { _id: company },
        {
          companyDelivery: companyDelivery._id,
        },
      );
    }

    return res.send({
      status: 200,
      message: "Registro criado com sucesso",
      data: companyDelivery,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/CompanyDelivery/CreateController.js',
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

    console.log("Fail err", err);

    return res.status(400).send({
      message: "Falha ao criar Registro",
      Error: err.message,
    });
  }
};
