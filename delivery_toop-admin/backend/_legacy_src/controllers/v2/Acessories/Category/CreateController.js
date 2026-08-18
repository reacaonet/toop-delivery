const mongoose = require('mongoose');
const Category = require('../../../../models/Accessories/CategoryModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {

    try {
        const data = req.body;
        data._id = new mongoose.Types.ObjectId().toHexString();

        data.isPaused = (
            ((typeof data.isPaused === 'string') && data.isPaused === "") ||
            (data.isPaused === null)
          ) ? false : data.isPaused;

        const category = await Category.create(data);

        return res.send({
            status: 200,
            message: "Categoria criado com sucesso",
            data: category
        });

    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/v2/Acessories/Category/CreateController.js',
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
