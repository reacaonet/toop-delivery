const sales = require('./SalesController')

module.exports = {
  method: {
    token: sales.token,
    sales: sales.sales,
    saveCard: sales.saveCard,
    getCard: sales.getCard,
    zeroAuth: sales.zeroAuth,
    getPaymentCredit: sales.getPaymentCredit,
    capture: sales.captureCredit,
    capturePartial: sales.capturePartial,
    cancel: sales.cancel,
    cancelPartial: sales.cancelPartial,
  }
}
