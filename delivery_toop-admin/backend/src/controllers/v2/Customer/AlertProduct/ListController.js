/** Model */
const AlertProduct = require('../../../../models/Customer/AlertProduct/AlertProduct');
const LogModel = require("../../../../models/LogModel");

/**
 * GET
 * URL - /v2/customer-alert-product/alert-product/notification
 */
const listar = async (req, res) => {
  try {
    const {customer} = req.query;
    const filter = {};

    filter.active = true;

    if (customer) {
      filter.customer = customer;
    }

    const alertProducts = await AlertProduct.find(filter).lean();
    return res.status(200).send(alertProducts);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Customer/AlertProduct/ListController.js',
      error: err?.message,
      method: 'listar',
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
      message: 'Não foi possível atualizar',
      err: err.message,
    });
  }
}

module.exports = listar;
