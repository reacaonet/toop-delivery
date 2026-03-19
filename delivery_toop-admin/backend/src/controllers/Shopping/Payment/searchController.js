const Payment = require("../../../models/Shopping/PaymentModel");
const LogModel = require("../../../models/LogModel");

const search = async (req, res) => {
  try {
    const { paymentProviderId } = req.query;
    let filter = {};

    if (paymentProviderId) {
      filter.paymentProviderId = {
        $eq: paymentProviderId,
      }
    }

    const payment = await Payment.findOne(filter).lean();

    return res.send(payment);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Payment/searchController.js',
      error: err?.message,
      method: 'search',
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
      message: "Falha ao listar",
      Error: err,
    });
  }
};

module.exports = search;
