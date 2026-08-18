function CaptureController() {
  const Braspag = require('../../../services/Payment/Braspag');
  const Payment = require('../../../models/Shopping/PaymentModel');
  const LogModel = require("../../../models/LogModel");

  async function total(req, res) {
    try {

      const paymentProvider = '7b81c476-d94a-4f0f-9faa-e844c7cdbcd3';
      let findPayment = await Payment.findOne({ paymentProviderId: paymentProvider });

      if (!findPayment || !findPayment._id) {
        return res.status(400).send({
          message: 'Não encontramos o pagamento'
        });
      }

      if (!findPayment.payload || !findPayment.payload.Payment.SplitPayments) {
        return res.status(400).send({
          message: 'Capture não foi do tipo Split'
        });
      }

      let split = findPayment.payload.Payment.SplitPayments;
      let price = findPayment.totalCompany * 100;
      let total = findPayment.payload.Payment.Amount;

      price = price.toFixed(0);
      split[0].Amount = price;

      total = total.toFixed(0);
      let totalEcbr = total - price;
      console.log(total, price, totalEcbr);

      split.push({
        SubordinateMerchantId: process.env.BRASPAG_CLIENT_ID,
        Amount: totalEcbr
      });

      console.log(total, price, totalEcbr, Number(price) + Number(totalEcbr));
      // const responseCapture = await Braspag().capture().total(paymentProvider, split, total);
      const responseCapture = await Braspag().capture().total(paymentProvider);

      if (!responseCapture) {
        return res.status(400).send({
          message: 'Falhou ao confirmar Captura ...',
          capture: responseCapture,
        });
      }

      return res.status(200).send({
        message: 'Tudo Certo',
        capture: responseCapture,
      });

    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Braspag/CaptureController.js',
        error: err?.message,
        method: 'total',
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
        message: 'Fail Capture',
        err: Boolean(process.env.production) === false ? err.message : '',
      });
    }
  }

  return {
    total
  }
}

module.exports = CaptureController;
