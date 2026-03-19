const mongoose = require('mongoose');
const Category = require('../../../models/Food/CategoryModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // Get company by header
    const company = req.company;

    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (mongoose.Types.ObjectId.isValid(company)) {
      data.company = mongoose.Types.ObjectId(company);
    }

    if (`${data.isPaused}` === 'true' || `${data.isPaused}` === 'false') {
      data.isPaused = `${data.isPaused}` === 'true' ? true : false
    } else {
      data.isPaused = false
    }

    const category = await Category.create(data);

    return res.send({
      status: 200,
      message: "Registro criado com sucesso",
    });

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Food/Category/CreateController.js',
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

    return res.status(400).send({
      message: "Falha ao criar registro...",
      Error: err.message
    });
  }
};
