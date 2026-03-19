const TransactionsController = require('./TransactionsController');
const NotificationController = require('./NotificationController');
const CaptureController = require('./CaptureController');

module.exports = {
  getTransactions: TransactionsController().getTransactions,
  getTransaction: TransactionsController().getTransaction,
  receive: TransactionsController().amountReceivable,
  notification: NotificationController().notification,
  capture: CaptureController().total,
};
