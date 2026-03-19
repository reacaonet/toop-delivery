const Invoices = require('../../../services/Invoice/ListInvoice');

const LogModel = require("../../../models/LogModel");

const ListController = async (req, res) => {
  try {
    let {
      page,
      limitPage,
      payment,
      order,
      company,
      type,
      owner
    } = req.query;
    const filter = {};

    if (page) {
      filter.page = page;
    }

    if (limitPage) {
      filter.limitPage = limitPage;
    }

    if (payment) {
      filter.payment = payment;
    }

    if (order) {
      filter.order = order;
    }

    if (company) {
      filter.company = company;
    }

    if (!type || (type !== 'INPUT' || type !== "OUTPUT")) {
      filter.type = type;
    }

    if (owner) {
      filter.owner = owner;
    }

    const response = await Invoices(filter);
    return res.status(200).json(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Invoice/ListController.js',
      error: err?.message,
      method: 'ListController',
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

    return res.status(400).json({
      message: 'Fail list Invoice',
      err: err.message
    });
  }
};

module.exports = ListController;
