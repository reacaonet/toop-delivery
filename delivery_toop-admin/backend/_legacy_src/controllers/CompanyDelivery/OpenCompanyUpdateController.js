const mongoose = require('mongoose');

const CompanyDelivery = require('../../models/Company/CompanyDeliveryModel');
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const company = req.company;

    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Falha ao validar a company vinculada ao usuário!",
      });
    }

    const open = (
      ((typeof data.isOpen === 'string') && data.isOpen === "") ||
      (data.isOpen === false)
    ) ? false : data.isOpen;

    const openCompany = await CompanyDelivery.findOneAndUpdate({
      company
    }, {
      $set: {
        isOpen: open,
        isManual: data.isManual,
      }
    }, {
      upsert: false,
      new: true,
    });

    res.send({
      status: 200,
      message: "atualizado com sucesso o is Open",
      data: openCompany
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/CompanyDelivery/OpenCompanyUpdateController.js',
    error: dadosDoErro?.message,
    method: 'OpenCompanyUpdateController',
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
      message: "Falha ao atualizar is Open",
      Error: dadosDoErro
    });
  }
};
