const mongoose = require("mongoose");

/** Model */
const PaymentModel = require("../../../../models/Shopping/PaymentModel");
const LogModel = require("../../../../models/LogModel");

const checkPayment = async (req, res) => {
  try {
    const { paymentId, franchisePaid } = req.body;

    if (!paymentId) {
      return res.status(400).send({
        message: "Informe uma transação válida",
      });
    }

    if (!mongoose.isValidObjectId(paymentId)) {
      return res.status(400).send({
        message: "Informe uma transação válida",
      });
    }

    await PaymentModel.updateOne(
      { _id: paymentId },
      {
        franchisePaid: true,
      },
    );

    return res.status(200).send({
      message: "Atualizado com sucesso",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/Balance/adm/checkPayment.js',
      error: err?.message,
      method: 'checkPayment',
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
      message: "Não fo possível alterar",
    });
  }
};

module.exports = checkPayment;
