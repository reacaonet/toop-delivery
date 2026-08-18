const mongoose = require('mongoose');

const Category = require('../../../../models/v1/Food/CategoryModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {

  try {
    const data = req.body;
    const { company } = req.params;

    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: 'Id da empresa inválido',
      })
    }

    data.company = company;

    let category = await Category.create(data);
    category = await category.populate('company', { name: 1 }).execPopulate();

    return res.send({
      status: 200,
      message: "Categoria criado com sucesso",
      data: category
    });

  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/v1/Food/Category/CreateController.js',
      error: dadosDoErro?.message,
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


    return res.status(400).send({
      message: "Falha ao criar Categoria...",
      Error: dadosDoErro
    });
  }
};