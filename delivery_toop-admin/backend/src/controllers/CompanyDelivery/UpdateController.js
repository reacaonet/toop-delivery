const mongoose = require("mongoose");

const CompanyDelivery = require("../../models/Company/CompanyDeliveryModel");
const CompanyModel = require("../../models/Company/CompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { isCompany, isFranchise, isRoot } = req;
    const _id = req.params.id;
    const data = req.body;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send({
        message: "Id do registro inválido!",
      });
    }

    const companyDelivery = await CompanyDelivery.findById(_id);

    data.own_delivery = (typeof data.own_delivery === "string" && data.own_delivery === "") || data.own_delivery === null ? false : data.own_delivery;
    data.online_delivery =
      (typeof data.online_delivery === "string" && data.online_delivery === "") || data.online_delivery === null ? false : data.online_delivery;

    data.withdrawMarket = (typeof data.withdrawMarket === "string" && data.withdrawMarket === "") || data.withdrawMarket === null ? false : data.withdrawMarket;

    if (data.own_delivery && (`${data.own_delivery}` === "true" || `${data.own_delivery}` === "false")) {
      data.own_delivery = JSON.parse(`${data.own_delivery}`);
    }
    if (data.online_delivery && (`${data.online_delivery}` === "true" || `${data.online_delivery}` === "false")) {
      data.online_delivery = JSON.parse(`${data.online_delivery}`);
    }

    data.has_split = (typeof data.has_split === "string" && data.has_split === "") || data.has_split === null ? false : data.has_split;

    // trata as informações do frete gratis
    if (data.shippingInfo) {
      if (
        (!companyDelivery.shippingInfo ||
          companyDelivery.shippingInfo.freeShipping !== data.shippingInfo.freeShipping ||
          companyDelivery.shippingInfo.freeShippingAbove !== data.shippingInfo.freeShippingAbove) &&
        `${data.shippingInfo.freeShipping}` === "true"
      ) {
        // no if a cima checa se hove alteração no registro para poder atualizar o responsavel
        data.shippingInfo.activatedBy = isCompany ? "company" : isFranchise ? "franchise" : isRoot ? "root" : "";
      } else {
        data.shippingInfo.activatedBy = companyDelivery.shippingInfo.activatedBy;
      }
    }

    const updateCompanyDelivery = await CompanyDelivery.findByIdAndUpdate({ _id }, data, {
      upsert: true,
      new: true,
    }).populate("company", {
      name: 1,
    });

    if (updateCompanyDelivery && updateCompanyDelivery.company && updateCompanyDelivery.company._id) {
      await CompanyModel.findByIdAndUpdate(
        {
          _id: updateCompanyDelivery.company._id,
        },
        {
          $set: {
            companyDelivery: updateCompanyDelivery._id,
          },
        },
        {
          upsert: false,
        },
      );
    }

    res.send({
      status: 200,
      message: "Registro atualizada com sucesso",
      data: updateCompanyDelivery,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/CompanyDelivery/UpdateController.js',
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


    return res.status(400).send({
      message: "Falha ao Atualizar Empresa Delivery",
      Error: dadosDoErro,
    });
  }
};
