const mongoose = require("mongoose");

const CompanyDelivery = require("../../models/Company/CompanyDeliveryModel");
const CompanyModel = require("../../models/Company/CompanyModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const _id = req.params.id;
    const data = req.body;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send({
        message: "Id do registro inválido!",
      });
    }

    const updateCompanyDelivery = await CompanyDelivery.findOneAndUpdate(
      {
        company: _id,
      },
      data,
      {
        upsert: true,
        new: true,
      }
    ).populate("company", {
      name: 1,
    });

    if (
      updateCompanyDelivery &&
      updateCompanyDelivery.company &&
      updateCompanyDelivery.company._id
    ) {
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
        }
      );
    }

    res.send({
      status: 200,
      message: "Registro atualizada com sucesso",
      data: updateCompanyDelivery,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/CompanyDelivery/UpdateCompanyIdController.js',
    error: dadosDoErro?.message,
    method: 'UpdateCompanyIdController',
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
