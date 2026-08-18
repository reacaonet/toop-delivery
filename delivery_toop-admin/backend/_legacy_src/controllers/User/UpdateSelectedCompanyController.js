const mongoose = require("mongoose");
const User = require("../../models/UserModel");
const Shopper = require("../../models/ShopperModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    let { company } = req.body;

    if (!company || !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: "Informe um Company válido",
      });
    }

    let data = {
      company,
    };

    const novoRegistro = await User.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: false,
        new: true,
      },
    );

    const novoRegistroPerson = await Shopper.findOneAndUpdate(
      {
        person: novoRegistro.person,
      },
      data,
      {
        upsert: false,
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "Selected Company atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/User/UpdateSelectedCompanyController.js',
      error: dadosDoErro?.message,
      method: 'UpdateSelectedCompanyController',
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


    console.log(dadosDoErro);
    return res.status(400).send({
      message: "Falha ao atualizar company",
      Error: dadosDoErro,
    });
  }
};
