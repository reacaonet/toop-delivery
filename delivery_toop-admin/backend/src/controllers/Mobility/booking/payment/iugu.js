const validator = require("validator").default;

const logPayment = require("../../../Shopping/Payment/util/logPayment");

const payloadIugu = require("../../../Shopping/Payment/Iugu/payloadPayment");

const { geoCode } = require("../../../../services/maps/geoCode");
const paymentApi = require("../../../../services/paymentApi");

const CustomerModel = require("../../../../models/CustomerModel");
const PaymentMethodModel = require("../../../../models/Shopping/PaymentMethodModel");
const PaymentModel = require("../../../../models/Mobility/Payment/PaymentModel");

async function iugu(body) {
  const {
    customer,
    passenger,
    price,
    payment,
    typePayment,
  } = body;

  const foundCustomer = await CustomerModel.findById(customer).populate('person');

  let isEmail = false;

  if (foundCustomer.email && validator.isEmail(`${foundCustomer.email}`)) {
    isEmail = true;
  } else if (foundCustomer.person && foundCustomer.person.email && validator.isEmail(`${foundCustomer.person.email}`)) {
    isEmail = true;
  }

  if (isEmail === false) {
    throw new Error("E-mail não encontrado, vá até o Meu Perfil e informe um e-mail válido");
  }

  const cart = {
    _id: passenger._id,
  };

  const cartItens = [
    {
      _id: body.service,
      price: body.price,
      amount: 1,
      product: {
        name: `Corrida até ${body.destiny[0].address}`,
      },
    },
  ];

  const paymentMethod = await PaymentMethodModel.findOne({ customer, isMain: true });

  const delivery = await geoCode(body.origin.latitude, body.origin.longitude);
  const payload = await payloadIugu(foundCustomer, paymentMethod, cart, cartItens, price, delivery, price, undefined, 0);

  if (payload === false) {
    return res.status(400).send({
      message: "Verifique as informações enviadas e tente novamente",
    });
  }

  const { data: response } = await paymentApi.post("/iugu/transactions", payload);

  if (!response) {
    return res.status(400).send({
      status: "error",
      message: "Erro ao efetuar Pagamento",
    });
  }

  await PaymentModel.updateOne(
    { _id: payment._id },
    {
      iugu_id: response.id,
      paymentProviderId: response.id,
    },
  );

  if (response.status !== "paid" && typePayment !== "PIX") {
    const message = `${response.acquirerMessage} - Tente novamente`;
    return res.status(400).send({
      status: "error",
      message: message,
    });
  }

  let dataResp = response;
  let statusResponse = "REFUSED";
  let status = "error";
  let statusMessage = "";

  if (response.statusMessage) {
    statusMessage = response.statusMessage;
  }

  if (typePayment !== "PIX") {
    if (dataResp.status === "paid") {
      statusResponse = "APPROVED";
      status = 2;
    }
  } else {
    if (dataResp.status === "pending") {
      statusResponse = "AWAITING_PAYMENT";
      status = 0;
    }
  }

  logPayment(
    {
      payload: dataResp,
      message: "Antes de criar o pagamento",
    },
    "payment-before-pagarme",
    "WARN",
  );

  await CustomerModel.updateOne(
    { _id: foundCustomer._id },
    {
      iugu_id: dataResp.customer_id,
    },
  );

  await PaymentModel.updateOne(
    { _id: payment._id },
    {
      iugu_id: dataResp.id,
      paymentProviderId: dataResp.id,
      payload: dataResp,
      statusPayload: dataResp.status,
      capture: true,
      status: statusResponse,
    },
  );

  return {
    provider: "iugu",
    status: status,
    paymentId: payment._id,
    statusMessage,
    ...dataResp.pix,
  };
}

async function iuguPix(
  customer,
  total,
  customer,
) {
  let isPhone = false;
  if (customer.person && customer.person.phone) {
    if (validator.isMobilePhone(`${customer.person.phone}`, "pt-BR")) {
      isPhone = true;
    }
  } else if (customer.phone) {
    if (validator.isMobilePhone(`${customer.phone}`, "pt-BR")) {
      isPhone = true;
    }
  }

  if (isPhone === false) {
    return res.status(400).send({
      status: "error",
      message: "Telefone não encontrado, vá até o Meu Perfil e informe um telefone válido",
    });
  }

  let isEmail = false;

  if (customer.email && validator.isEmail(`${customer.email}`)) {
    isEmail = true;
  } else if (customer.person && customer.person.email && validator.isEmail(`${customer.person.email}`)) {
    isEmail = true;
  }

  if (isEmail === false) {
    return res.status(400).send({
      status: "error",
      message: "E-mail encontrado, vá até o Meu Perfil e informe um e-mail válido",
    });
  }

  const check = await PaymentMethodModel.findOne({ shoppingCart: cart._id }).sort({ createdAt: -1 }).lean();

  let paymentCreate = await PaymentMethodModel.create({
    customer,
    shoppingCart: cart._id,
    company: cart.company._id,
    coupon,
    couponPrice,
    total: total.toFixed(2),
    totalCompany: cartTotal.subTotal.toFixed(2),
    priceDelivery: cartTotal.deliveryFee.toFixed(2),
    serviceCharge: cartTotal.serviceCharge.toFixed(2),
    deliveryAddress: delivery._id,
    provider: "iugu",
    typePayment: "PIX",
    valueTip: tip,
    usedCashback: usedCashback ? usedCashback : 0,
    freeShippingBonus: cartTotal.shippingInfo.free.toFixed(2),
    freeShippingBonusOrigin: cartTotal.shippingInfo.origin,
  });

  await debitPriceCompany(paymentCreate._id, cart);
  paymentCreate = await PaymentMethodModel.findById(paymentCreate._id);
  const payload = await payloadIugu(customer, null, cart, cartItens, total, delivery, cartTotal, paymentCreate, "PIX");

  if (payload === false) {
    return res.status(400).send({
      message: "Verifique as informações enviadas e tente novamente",
    });
  }

  const { data: response } = await paymentApi.post("/iugu/transactions", payload);

  if (!response) {
    return res.status(400).send({
      status: "error",
      message: "Erro ao efetuar Pagamento",
    });
  }

  await PaymentMethodModel.updateOne(
    { _id: paymentCreate._id },
    {
      iugu_id: response.id,
      paymentProviderId: response.id,
      typeSchedule: typeSchedule,
      deliveryFree: deliveryFree,
    },
  );

  let dataResp = response;
  let statusResponse = "REFUSED";
  let status = "error";
  let statusMessage = "";

  if (response.statusMessage) {
    statusMessage = response.statusMessage;
  }

  statusResponse = "AWAITING_PAYMENT";
  status = 0;

  logPayment(
    {
      payload: dataResp,
      message: "Antes de criar o pagamento",
    },
    "payment-before-pagarme",
    "WARN",
  );

  await CustomerModel.updateOne(
    { _id: customer._id },
    {
      iugu_id: dataResp.customer_id,
    },
  );

  await PaymentMethodModel.updateOne(
    { _id: paymentCreate._id },
    {
      iugu_id: dataResp.id,
      paymentProviderId: dataResp.id,
      payload: dataResp,
      statusPayload: dataResp.status,
      capture: true,
      status: statusResponse,
    },
  );

  return res.send({
    provider: "iugu",
    status: status,
    paymentId: paymentCreate._id,
    statusMessage,
    ...dataResp.pix,
  });
}

async function iuguRetry(
  payment,
  customer,
  paymentMethod,
  total,
  customer,
) {
  const { data: response } = await paymentApi.post(`/iugu/transactions/${payment.iugu_id}/retry`, { token: paymentMethod.cardToken });

  if (!response || response.status !== "paid") {
    const message = `${response.acquirerMessage} - Tente novamente`;
    return res.status(400).send({
      status: "error",
      message: message,
    });
  }

  let dataResp = response;
  let statusResponse = "REFUSED";
  let status = "error";
  let statusMessage = "";

  if (response.statusMessage) {
    statusMessage = response.statusMessage;
  }

  if (dataResp.status === "paid") {
    statusResponse = "APPROVED";
    status = 2;
  }

  logPayment(
    {
      payload: dataResp,
      message: "Antes de criar a tentativa pagamento",
    },
    "payment-before-pagarme",
    "WARN",
  );

  await PaymentMethodModel.updateOne(
    { _id: payment._id },
    {
      iugu_id: dataResp.id,
      paymentProviderId: dataResp.id,
      payload: dataResp,
      statusPayload: dataResp.status,
      capture: true,
      status: statusResponse,
    },
  );

  if (payment && payment._id && dataResp.status === "paid") {
    await afterPayment(payment, dataResp, cart, delivery, valueTip, typeSchedule);
  }

  return res.send({
    provider: "iugu",
    status: status,
    paymentId: payment._id,
    statusMessage,
  });
}

module.exports = { iugu, iuguPix, iuguRetry };