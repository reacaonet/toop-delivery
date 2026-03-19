const LogModel = require("../../../models/LogModel");

const Braspag = require('../../../services/Payment/Braspag');
const Transactions = Braspag().transactions();
const moment = require('moment');

function TransactionsController() {

  /**
   * @param {
      Scheduled: Agendado
      Pending: Aguardando confirmação de liquidação
      Settled: Liquidado
      Error: Erro de liquidação na instituição financeira.
      WaitingForAdjustementDebit: Aguardando liquidação do ajuste de débito associado.
      Anticipated: Evento antecipado.
    } eventStatus
   */
  async function getTransactions(req, res) {
    try {
      let {
        initial, final, eventStatus, page
      } = req.query;
      let pageSize = 100;

      if (!eventStatus) {
        eventStatus = 'Scheduled';
      }

      if (!initial || !final) {
        initial = moment().utc(0).subtract('3', 'hours').format('YYYY-MM-DD');
        final = initial;
      }

      if (!page || page <= 0) {
        page = 1
      }

      const responseTransaction = await Transactions.getTransactions(
        initial,
        final,
        page,
        pageSize,
        eventStatus,
      );

      return res.status(200).send(responseTransaction);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Braspag/TransactionsController.js',
        error: err?.message,
        method: 'getTransactions',
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
        message: 'Fail Get Transactions',
        err: process.env.production === 'false' ? err.message : '',
      });
    }
  }

  async function getTransaction(req, res) {
    try {
      const { paymentId, merchantId } = req.params;

      if (!paymentId) {
        return res.status(400).send({
          message: 'Informe o PaymentId'
        });
      }

      if (!merchantId) {
        return res.status(400).send({
          message: 'Informe o merchantID'
        });
      }

      const responseTransaction = await Transactions.getTransaction(paymentId, merchantId);

      return res.status(200).send({
        paymentId,
        merchantId,
        transaction: responseTransaction,
      });
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Braspag/TransactionsController.js',
        error: err?.message,
        method: 'getTransaction',
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
        message: 'Fail Get Transaction',
        err: process.env.production === 'false' ? err.message : '',
      });
    }
  }

  async function amountReceivable(req, res) {
    try {
      let {
        initial, final, eventStatus, page, merchantId
      } = req.query;
      let pageSize = 100;

      if (!eventStatus) {
        eventStatus = 'Scheduled';
      }

      if (!initial || !final) {
        initial = moment().utc(0).subtract('3', 'hours').format('YYYY-MM-DD');
        final = initial;
      }

      if (!page || page <= 0) {
        page = 1
      }

      const receive = await Transactions.amountReceivable(
        initial,
        final,
        page,
        pageSize,
        eventStatus,
        merchantId
      );

      return res.status(200).send(receive);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Braspag/TransactionsController.js',
        error: err?.message,
        method: 'amountReceivable',
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
        message: 'Fail Get amountReceivable',
        err: process.env.production === 'false' ? err.message : '',
      });
    }
  }

  return {
    getTransactions,
    getTransaction,
    amountReceivable,
  }
}


module.exports = TransactionsController;
