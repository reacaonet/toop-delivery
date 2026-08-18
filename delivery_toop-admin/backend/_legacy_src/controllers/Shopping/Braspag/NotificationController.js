/**
 * ChangeType
    1	Mudança de status do pagamento
    2	Recorrência criada
    3	Mudança de status do AntiFraude
    4	Mudança de status do pagamento recorrente (Ex. desativação automática)
    5	Estorno negado (aplicável para Rede)
    6	Boleto registrado pago a menor
    7	Notificação de chargeback, Para mais detalhes Risk Notification
    8	Alerta de fraude
 */

function NotificationController() {

  const Payment = require('../../../models/Shopping/PaymentModel');
  const LogModel = require('../../../models/LogModel');
  const moment = require('moment');
  const Cielo = require('../../../services/Payment/Cielo');
  const Braspag = require('../../../services/Payment/Braspag');

  async function notification(req, res) {
    try {

      const { RecurrentPaymentId, PaymentId, ChangeType } = req.body;
      if (!RecurrentPaymentId || !PaymentId || !ChangeType) {
        return res.status(400).send({
          message: 'Inforeme todos os parametros obrigatórios'
        });
      }

      let payment = await Payment.findOne({ paymentProviderId: PaymentId }).lean();

      if (!payment || !payment._id) {
        // Id do Pagamento não encontrado
        logNotification({
          body: req.body,
          params: req.params,
          query: req.query,
        }, 'braspag-not-found-notification');
        return res.status(200).send();
      }

      let braspagNotification = payment.braspagNotification;
      if (!braspagNotification || typeof braspagNotification !== 'object' && braspagNotification.length <= 0) {
        braspagNotification = [];
      }

      let statusNotification = payment.statusNotification;
      if (!statusNotification || typeof statusNotification !== 'object' && statusNotification.length <= 0) {
        statusNotification = [];
      }

      braspagNotification.push({
        "RecurrentPaymentId": RecurrentPaymentId,
        "PaymentId": PaymentId,
        "ChangeType": ChangeType,
        'creatAt': moment().format(),
      });

      let paymentCredit = await Cielo.sales.getPaymentCredit(PaymentId);

      if (!paymentCredit || !paymentCredit.Payment || !paymentCredit.Payment.PaymentId) {
        logNotification({
          message: 'Pagamento não encontrado na Cielo',
          payment,
        });

        return res.status(400).send({
          message: 'Pagamento não encontrado na Cielo',
        });
      }

      let txtStatus = Cielo.sales.statusPay(paymentCredit.Payment.Status);

      statusNotification.push({
        txtStatus: txtStatus,
        status: paymentCredit.Payment.Status,
      });

      let update = await Payment.updateOne({ _id: payment._id }, {
        payload: paymentCredit,
        braspagNotification: braspagNotification,
        statusNotification: statusNotification,
        statusPayload: paymentCredit.Payment.Status,
      });

      if (!update || !update.nModified || update.nModified <= 0) {
        logNotification({
          paymentCredit,
        }, 'fail-update-notification');
      }

      return res.status(200).send();
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Braspag/NotificationController.js',
        error: err?.message,
        method: 'notification',
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

      logNotification(err, 'braspag-error-notification');
      return res.status(400).send({
        message: 'Falhou ao comunicar',
      });
    }
  }

  const logNotification = (err, originError) => {
    try {
      Log.create({
        typeSystem: "BACKEND",
        typeLog: "ERROR",
        description: err,
        category: 'braspag-notification',
        originError: originError,
      });
    } catch (err) {
      console.log('Opps fail create log', err);
    }
  };

  return {
    notification,
  }
}

module.exports = NotificationController;
