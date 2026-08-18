const mongoose = require('mongoose');
const ProductComplementItem = require('../../../../models/Accessories/ProductComplementItemModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {

  try {
    const data = req.body;

    data.isPaused = (
      ((typeof data.isPaused === 'string') && data.isPaused === "") ||
      (data.isPaused === null)
    ) ? false : data.isPaused;

    const product = await ProductComplementItem.create(data);

    return res.send({
      status: 200,
      message: "Item criado com sucesso",
      data: product
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Acessories/ProductComplementItem/CreateController.js',
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
      message: "Falha ao criar Item",
      err: err.message,
    });
  }
};
