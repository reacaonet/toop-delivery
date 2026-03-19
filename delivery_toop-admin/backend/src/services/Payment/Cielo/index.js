const generateToken = require('./Token');
const pay = require('./Sales');
const card = require('./Card');
const SalesQuery = require('./SalesQuery');
const capture = require('./Capture');
const Cancellation = require('./Cancellation');
const Status = require('./Status');
const subordinates = require('./subordinates');

module.exports = {
  token: generateToken,
  sales: {
    pay,
    statusPay: Status.statusMessage,
    saveCard: card.saveCard,
    getCard: card.getCard,
    zeroAuth: card.zeroAuth,
    cardBin: card.cardBin,
    cardBinStatus: card.cardBinStatus,
    getPaymentCredit: SalesQuery.getSaleCredit,
    getMerchantOrder: SalesQuery.merchantOrder,
    capture: capture.confirmCapture,
    capturePartial: capture.partial,
    confirmCapturePartial: capture.partialConfirm,
    cancel: Cancellation.cancel,
    cancelPartial: Cancellation.cancelPartial,
    createSubordinates: subordinates.create,
    verifySubordinates: subordinates.verify,
  },
  message: {
    cardBinStatusError: card.cardBinStatusError,
  },
}
