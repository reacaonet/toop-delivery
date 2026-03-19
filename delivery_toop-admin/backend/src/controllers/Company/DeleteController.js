const CompanyModel = require('../../models/Company/CompanyModel');
const DeliveryModel = require('../../models/Company/CompanyDeliveryModel')
const UserModel = require('../../models/UserModel')
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id
    const dateCurrent = new Date()

    const resp = await CompanyModel.findByIdAndUpdate(
      id,
      {
        $set: {
          deletedAt: dateCurrent,
        },
      },
      {
        new: true,
      },
    );

    if (resp) {
      await DeliveryModel.updateMany({ company: id }, {
        deletedAt: dateCurrent
      })

      await UserModel.updateMany({ company: id },{
        deletedAt: dateCurrent
      });
    }

    res.send({
      status: 200,
      message: "Empresa deletada com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/DeleteController.js',
    error: dadosDoErro?.message,
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


    return res.status(400).send({
      message: "Falha ao deletar Empresa",
      error: dadosDoErro
    });
  }
};
