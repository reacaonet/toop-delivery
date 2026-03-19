const Product = require('../../../../models/Accessories/ProductModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id });

    res.json(product);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Acessories/Product/onlyController.js',
      error: err?.message,
      method: 'onlyController',
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
      message: "Falha ao atualizar Produto",
      err: err.message,
    });
  }
};
