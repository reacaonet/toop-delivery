const mongoose = require("mongoose");

/** Model */
const PaymentModel = require("../../models/Mobility/Payment/PaymentModel");
const PixGenerateModel = require("../../models/Shopping/PixGenerateModel");
const LogModel = require("../../models/LogModel");

/** Service */
const paymentApi = require("../../services/paymentApi");

const chargeBack = async paymentId => {
  try {
    // console.log("chargeBack iniciado ...");
    let paymentProviderId;

    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
      return false;
    }

    const payment = await PaymentModel.findOne({
      _id: mongoose.Types.ObjectId(paymentId),
    })
      .populate("order")
      .lean();

    if (!payment) {
      return false;
    }

    paymentProviderId = payment.paymentProviderId;

    // if (payment.typePayment === "PIX") {
    //   const pix = await PixGenerateModel.findOne({
    //     shoppingCart: mongoose.Types.ObjectId(payment.shoppingCart),
    //   }).lean();

    //   paymentProviderId = pix.txid;
    // }

    if (!payment || !paymentProviderId) {
      return false;
    }

    console.log("enviando solicitação de estorno e cancelamento ...");

    let resp;
    if (paymentProviderId) {
      const data = await paymentApi.post(`/iugu/transactions/${paymentProviderId}/refund`);

      resp = data.data;
    }

    if (!resp && resp.Status) {
      return false;
    }

    // Atualizar Pagamento
    await PaymentModel.updateOne(
      { _id: paymentId },
      {
        status: "CHARGEBACK",
      },
    );

    return true;
  } catch (err) {
    console.log("falhou o chargeback");

    console.log(err);
    return false;
  }
};

const paymentChargeback = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).send({
        message: "Informe uma transação válida",
      });
    }

    const realized = await chargeBack(paymentId);

    if (realized) {
      return res.status(200).send({
        message: "Estorno realizado com sucesso",
      });
    } else {
      return res.status(400).send({
        message: "Não fo possível realizar o estorno",
      });
    }
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Finance/chargeback.js',
      error: err?.message,
      method: 'paymentChargeback',
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
      message: "Não fo possível fazer o estorno",
    });
  }
};

module.exports = { paymentChargeback, chargeBack };
