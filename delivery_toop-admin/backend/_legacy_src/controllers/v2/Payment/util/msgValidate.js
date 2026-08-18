const logPayment = require("./logPayment");

const notFoundCardMsg = (res, addDebug) => {
  logPayment(addDebug, "Error-cart-payment-not-found");
  return res.status(400).send({
    status: "error",
    message: "Carrinho não encontrado ou já finalizado...",
  });
};

const notAddress = (res, addDebug) => {
  addDebug.message = "Endereço de Entrega não cadastrado, por favor informe um endereço de entrega";
  logPayment(addDebug, "Error-delivery-payment");
  return res.status(400).send({
    status: "error",
    message: addDebug.message,
  });
};

const notCustomer = (res, addDebug) => {
  addDebug.message = "Cliente não encontrado";
  logPayment(addDebug, "Error-customer-payment");
  return res.status(400).send({
    status: "error",
    message: addDebug.message,
  });
};

const totalZeroOrNegative = (res, addDebug) => {
  addDebug.message = "Não foi possível concluir, por favor tente mais tarde ...";
  logPayment(addDebug, "Error-cart-payTotal");

  return res.status(400).send({
    status: "error",
    message: addDebug.message,
  });
};

const failToSave = (res, addDebug) => {
  logPayment(addDebug, "Error-cart-failToSave");
  return res.status(400).send({
    status: "error",
    message: "Não conseguimos processor o pagamento, por favor tente mais tarde!!",
  });
};

const failCreateOrder = (res, addDebug) => {
  logPayment(addDebug, "Error-create-order");
  return res.status(400).send({
    status: "error",
    message: "Não conseguimos processor o pagamento, por favor tente mais tarde!!",
  });
};

module.exports = {
  notFoundCardMsg,
  notAddress,
  notCustomer,
  totalZeroOrNegative,
  failToSave,
  failCreateOrder,
};
