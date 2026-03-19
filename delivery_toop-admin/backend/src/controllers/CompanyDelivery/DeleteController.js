const mongoose = require('mongoose')

const CompanyDelivery = require('../../models/Company/CompanyDeliveryModel');
const CompanyModel = require('../../models/Company/CompanyModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const company = req.params.company

    if (!company || !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: 'Informe uma empresa válida'
      })
    }

    await CompanyModel.updateOne({
      _id: company
    }, {
      $unset: {
        companyDelivery: 1
      }
    })

    await CompanyDelivery.updateOne({
      company: company
    }, {
      deletedAt: new Date()
    })

    res.send({
      status: 200,
      message: "Registro deletado com sucesso"
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/CompanyDelivery/DeleteController.js',
      error: err?.message,
      method: 'DeleteController',
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

    console.log('Fail delete', err)
    return res.status(400).send({
      message: "Falha ao deletar Registro",
      error: err.message
    });
  }
};
