const logPayment = require('./logPayment');

const validatePayment = (respPayment, addDebug) => {
  try {
    if (!respPayment) {
      addDebug.message = "Não foi possível concluir a compra por favor verifique o método de pagamento selecionado";
      logPayment(addDebug, "payment-cielo-respPayment");
      return false;
    }

    if (!respPayment.Payment || !respPayment.Payment.Status) {
      addDebug.message = "Não foi possível concluir a compra por favor verifique o método de pagamento selecionado";
      logPayment(addDebug, "payment-cielo-error");
      return false;
    }

    return true;
  } catch (err) {
    console.log('Error geral validatePayment', err);
    return false
  }
}

module.exports = validatePayment;
