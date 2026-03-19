/** Global */
const mongoose = require("mongoose");
const moment = require("moment");
const validator = require("validator").default;

/** MODEL */
const Cart = require("../../../models/Shopping/CartModel");
const DeliveryAddres = require("../../../models/Customer/DeliveryAddressModel");
const CustomerModel = require("../../../models/CustomerModel");
const PaymentMethod = require("../../../models/Shopping/PaymentMethodModel");
const CartItens = require("../../../models/Shopping/CartItemModel");
const Payment = require("../../../models/Shopping/PaymentModel");
const CouponModel = require("../../../models/Coupon/CouponModel");
const CompanyCoupon = require("../../../models/Coupon/CouponCompanyModel");
const CompanyDelivery = require("../../../models/Company/CompanyDeliveryModel");
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const PayTotal = require("./PayTotalController");
const Cielo = require("../../../services/Payment/Cielo");
const paymentApi = require("../../../services/paymentApi");
const afterPayment = require("./AfterPayment");

/** PagarMe */
const payloadPagarMe = require("./PagarMe/payloadPayment");
const payloadIugu = require("./Iugu/payloadPayment");

/* UTIL */
// const getFingerprint = require('./util/fingerprint');
const validCreatePost = require("./util/validatePost");
const logPayment = require("./util/logPayment");
const cieloData = require("./util/cieloData");
const customerData = require("./util/customerData");
const paymentData = require("./util/paymentData");
const validatePayment = require("./util/validatePayment");
const distanceKM = require("../../../utils/distanceCoordinate");
const { formatMoney } = require("../../../utils");

function MakePaymentController() {
  // let fingerprint = "";
  let addDebug = {};
  let cartTotal = {};
  let total = 0; // Total da Fatura
  let cartItens = [];
  let capture = true;
  let provider = process.env.PROVIDER_PAYMENT_CIELO;
  let paymentType = "splittedcreditcard"; //Braspag  //'CreditCard' -> Cielo

  /**
   * POST
   * Url - payment/send/cart/:cartId
   */
  async function pay(req, res) {
    try {
      const msgValid = validCreatePost({ ...req.body, ...req.params });
      if (msgValid !== null) {
        logPayment({ message: msgValid }, "payment-not-valid");
        return res.status(400).send({
          status: "error",
          message: msgValid,
        });
      }

      addDebug = {};
      addDebug.params = req.params;
      addDebug.body = req.body;

      const { cartId } = req.params;
      const { customer, ipAddress, coupon, valueTip, fingerPrintId, typeSchedule, deliveryFree, usedCashback } = req.body;
      const { freeShippingBonus, freeShippingBonusOrigin, typePayment } = req.body;

      let tip = null;

      const cart = await Cart.findOne({ _id: cartId, customer: customer })
        .populate({
          path: "company",
          populate: {
            path: "companyDelivery",
            select: {
              max_distance: 1,
              min_purchase: 1,
            },
          },
        })
        .lean();

      if (!cart || !cart.status || cart.status !== "pending") {
        logPayment(addDebug, "Error-cart-payment-not-found");
        return res.status(400).send({
          status: "error",
          message: "Carrinho não encontrado ou já finalizado...",
        });
      }

      addDebug.body = req.cart;
      const delivery = await DeliveryAddres.findOne({
        customer,
        main: true,
      }).lean();

      if (!delivery || !delivery.address) {
        addDebug.message = "Endereço de Entrega não cadastrado, por favor informe um endereço de entrega";
        logPayment(addDebug, "Error-delivery-payment");
        return res.status(400).send({
          status: "error",
          message: addDebug.message,
        });
      }

      addDebug.body = req.delivery;
      const customerDB = await CustomerModel.findById(customer).populate("person").lean();

      if (!customerDB || !customerDB._id) {
        addDebug.message = "Cliente não encontrado";
        logPayment(addDebug, "Error-customer-payment");
        return res.status(400).send({
          status: "error",
          message: addDebug.message,
        });
      }

      // Distancia máxima de entrega
      if (
        cart.company &&
        cart.company.companyDelivery &&
        cart.company.companyDelivery.max_distance &&
        cart.company.companyDelivery.max_distance > 0 &&
        typeSchedule !== "WITHDRAWAL"
      ) {
        let km = distanceKM(
          {
            latitude: cart.company.location.coordinates[1],
            longitude: cart.company.location.coordinates[0],
          },
          {
            latitude: delivery.location.coordinates[1],
            longitude: delivery.location.coordinates[0],
          },
        );

        let maxDistance = cart.company.companyDelivery.max_distance / 1000;
        if (km > maxDistance) {
          return res.status(400).send({
            status: "error",
            message: `Verifique seu endereço de entrega, o estabelecimento só aceita pedidos em um raio de até ${maxDistance}KM`,
            km,
          });
        }
      }

      // cobrar taxa de entrega ?
      let isDelivery = true;
      if (typeSchedule && typeSchedule == "WITHDRAWAL") {
        isDelivery = false;
      } else if (typeSchedule == "DELIVERY" && `${deliveryFree}` == "true") {
        isDelivery = false;
      }

      cartTotal = await PayTotal.priceCart(cart._id, cart.company, isDelivery); // Informações do Carrinho
      total = PayTotal.totalCart(cartTotal, cart.company); // Total da fatura

      // Aplicar Desconto
      let couponPrice = await getCoupon(coupon, cart.company._id);
      if (couponPrice && couponPrice > 0) {
        total -= couponPrice;
      }

      // Aplica o cashback
      if (usedCashback && usedCashback > 0) {
        total -= usedCashback;
      }

      // Valor mínimo do pedido
      if (
        cart.company &&
        cart.company.companyDelivery &&
        cart.company.companyDelivery.min_purchase &&
        cart.company.companyDelivery.min_purchase > 0 &&
        cart.company.companyDelivery.min_purchase > cartTotal.subTotal
      ) {
        let difTotal = cart.company.companyDelivery.min_purchase - cartTotal.subTotal;

        return res.status(400).send({
          status: "error",
          message: `Valor mínimo para compra neste estabelecimento é de ${formatMoney(cart.company.companyDelivery.min_purchase)}, faltam ${formatMoney(
            difTotal,
          )} para completar o pedido mínimo`,
          minPurchase: cart.company.companyDelivery.min_purchase,
          subTotal: cartTotal.subTotal,
        });
      }

      if (!total || total <= 0) {
        addDebug.payTotal = cartTotal;
        addDebug.total = total;
        addDebug.message = "Não foi possível concluir, por favor tente mais tarde ...";
        logPayment(addDebug, "Error-cart-payTotal");

        return res.status(400).send({
          status: "error",
          message: "Valor de compra não permitido!!",
        });
      }

      // Adicionar Gorjeta
      if (valueTip && parseFloat(`${valueTip}`) > 0) {
        let vTip = parseFloat(`${valueTip}`);
        total = total + vTip;
        tip = vTip;
      }

      cartItens = await CartItens.find({ shoppingCart: cart._id }).populate("product").populate("foodProduct").lean();

      cartItens = cartItens.filter(item => {
        if (item && item.product && item.product._id && item.isDeleted === false && (!item.product.deletedAt || item.product.deletedAt === false)) {
          return item;
        } else if (
          item &&
          item.foodProduct &&
          item.foodProduct._id &&
          item.isDeleted === false &&
          (!item.foodProduct.deletedAt || item.foodProduct.deletedAt === false)
        ) {
          return item;
        }
      });

      let paymentMethod = null;

      if (typePayment !== "PIX") {
        paymentMethod = await PaymentMethod.findOne({
          customer: customerDB._id,
          isMain: true,
        })
          .sort({ updatedAt: -1 })
          .lean();

        if (!paymentMethod || !paymentMethod._id || !paymentMethod.document) {
          addDebug.message = "Não conseguimos identificar um métido de pagamento";
          logPayment(addDebug, "Error-paymentMethod");

          return res.status(400).send({
            message: "Não conseguimos identificar um métido de pagamento",
          });
        }
      }

      if (process.env.GATEWAY_PAYMENT === "PAGARME") {
        return await pagarMe(
          res,
          customerDB,
          paymentMethod,
          cart,
          cartItens,
          total,
          delivery,
          cartTotal,
          customer,
          coupon,
          couponPrice,
          tip,
          valueTip,
          typeSchedule,
          usedCashback,
        );
      }

      if (process.env.GATEWAY_PAYMENT === "IUGU") {
        if (typePayment === "PIX") {
          return await iuguPix(
            res,
            customerDB,
            cart,
            cartItens,
            total,
            delivery,
            cartTotal,
            customer,
            coupon,
            couponPrice,
            tip,
            valueTip,
            typeSchedule,
            usedCashback,
            deliveryFree,
          );
        }
        return await iugu(
          res,
          customerDB,
          paymentMethod,
          cart,
          cartItens,
          total,
          delivery,
          cartTotal,
          customer,
          coupon,
          couponPrice,
          tip,
          valueTip,
          typeSchedule,
          usedCashback,
          typePayment,
        );
      }

      // Braspag
      return await braspag(
        res,
        customerDB,
        cart,
        cartTotal,
        paymentMethod,
        paymentType,
        delivery,
        capture,
        provider,
        total,
        coupon,
        couponPrice,
        customer,
        fingerPrintId,
        ipAddress,
        cartItens,
        tip,
        valueTip,
        typeSchedule,
        usedCashback,
      );
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Payment/MakePaymentController.js',
        error: err?.message,
        method: 'pay',
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

      console.log("Error-All-Payment", err);
      logPayment(err, "Error-All-Payment");
      return res.status(400).send({
        status: "error",
        message: "Por Favor, verifique as informações enviadas",
        errMessage: err.message,
        err: err,
      });
    }
  }

  async function braspag(
    res,
    customerDB,
    cart,
    cartTotal,
    paymentMethod,
    paymentType,
    delivery,
    capture,
    provider,
    total,
    coupon,
    couponPrice,
    customer,
    fingerPrintId,
    ipAddress,
    cartItens,
    tip,
    valueTip,
    typeSchedule,
    usedCashback,
  ) {
    const customerCielo = customerData(customerDB, paymentMethod);

    const paymentCielo = paymentData(paymentType, capture, provider, total, paymentMethod, fingerPrintId, ipAddress, cartItens);

    addDebug.paymentType = paymentType;
    addDebug.capture = capture;
    addDebug.provider = provider;
    addDebug.customerCielo = customerCielo;
    addDebug.paymentCielo = paymentCielo;

    if (customerCielo === false || paymentCielo === false) {
      addDebug.message = "Não foi possível concluir a compra por favor verifique as informações enviadas";
      logPayment(addDebug, "Error-cart-payment-not-found");
      return res.status(400).send({
        status: "error",
        message: addDebug.message,
      });
    }

    const payData = cieloData(cart._id, customerCielo, paymentCielo); // Payload Completo
    const respPayment = await sales(payData); // Realizar Pagamento

    if (validatePayment(respPayment, addDebug) === false) {
      return res.status(400).send({
        status: "error",
        message: "Não foi possível concluir a compra por favor verifique o método de pagamento selecionado",
        payData,
        respPayment,
      });
    }

    //Status Payment
    let statusResponse = "REFUSED";
    if (respPayment.Payment.Status === 1 || respPayment.Payment.Status === 2) {
      statusResponse = "APPROVED";
    }

    // Status do Pagamento em texto
    let statusMessage = Cielo.sales.statusPay(respPayment.Payment.Status);

    logPayment(
      {
        payload: respPayment,
        message: "Antes de criar o pagamento",
      },
      "payment-before-braspag",
    );

    const paymentCreate = await Payment.create({
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
      provider,
      paymentProviderId: respPayment.Payment.PaymentId,
      payload: respPayment,
      statusPayload: respPayment.Payment.Status,
      capture: capture,
      typePayment: "BRASPAG",
      valueTip: tip,
      status: statusResponse,
      shoppingPaymentMethod: paymentMethod._id,
      usedCashback: usedCashback ? usedCashback : 0,
      freeShippingBonus: cartTotal.shippingInfo.free.toFixed(2),
      freeShippingBonusOrigin: cartTotal.shippingInfo.origin,
      shippingInfo: cartTotal.shippingInfo.payload,
    });

    logPayment(
      {
        payload: paymentCreate,
        message: "Payment foi criado",
      },
      "payment-after-braspag",
    );

    if ((paymentCreate && paymentCreate._id && respPayment.Payment.Status === 1) || respPayment.Payment.Status === 2) {
      await afterPayment(paymentCreate, respPayment, cart, delivery, valueTip, typeSchedule);

      queueSplit(paymentCreate._id, respPayment, paymentCreate.createdAt); // Fila de divisão do Split
      debitPriceCompany(paymentCreate._id, cart);
    }

    return res.send({
      provider,
      status: respPayment.Payment.Status,
      paymentId: paymentCreate._id,
      statusMessage,
    });
  }

  async function pagarMe(
    res,
    customerDB,
    paymentMethod,
    cart,
    cartItens,
    total,
    delivery,
    cartTotal,
    customer,
    coupon,
    couponPrice,
    tip,
    valueTip,
    typeSchedule,
    usedCashback,
  ) {
    let isPhone = false;
    if (customerDB.person && customerDB.person.phone) {
      if (validator.isMobilePhone(`${customerDB.person.phone}`, "pt-BR")) {
        isPhone = true;
      }
    } else if (customerDB.phone) {
      if (validator.isMobilePhone(`${customerDB.phone}`, "pt-BR")) {
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

    if (customerDB.email && validator.isEmail(`${customerDB.email}`)) {
      isEmail = true;
    } else if (customerDB.person && customerDB.person.email && validator.isEmail(`${customerDB.person.email}`)) {
      isEmail = true;
    }

    if (isEmail === false) {
      return res.status(400).send({
        status: "error",
        message: "E-mail encontrado, vá até o Meu Perfil e informe um e-mail válido",
      });
    }

    let paymentCreate = await Payment.create({
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
      provider: "pagarme",
      typePayment: "PAGARME",
      valueTip: tip,
      shoppingPaymentMethod: paymentMethod._id,
      usedCashback: usedCashback ? usedCashback : 0,
      freeShippingBonus: cartTotal.shippingInfo.free.toFixed(2),
      freeShippingBonusOrigin: cartTotal.shippingInfo.origin,
    });

    await debitPriceCompany(paymentCreate._id, cart);
    paymentCreate = await Payment.findById(paymentCreate._id);
    const payload = await payloadPagarMe(customerDB, paymentMethod, cart, cartItens, total, delivery, cartTotal, paymentCreate);

    if (payload === false) {
      return res.status(400).send({
        message: "Verifique as informações enviadas e tente novamente",
      });
    }

    const { data: response } = await paymentApi.post("/pagar-me/transactions", payload);

    if (!response || !response.data || !response.data.status) {
      return res.status(400).send({
        status: "error",
        message: "Não foi possível concluir a compra por favor verifique o método de pagamento selecionado",
      });
    }

    let dataResp = response.data;
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
        message: "Antes de criar o pagamento",
      },
      "payment-before-pagarme",
      "WARN",
    );

    await Payment.updateOne(
      { _id: paymentCreate._id },
      {
        paymentProviderId: dataResp.id,
        payload: dataResp,
        statusPayload: dataResp.status,
        capture: true,
        status: statusResponse,
      },
    );

    if (paymentCreate && paymentCreate._id && dataResp.status === "paid") {
      await afterPayment(paymentCreate, dataResp, cart, delivery, valueTip, typeSchedule);
    }

    return res.send({
      provider: "pagarme",
      status: status,
      paymentId: paymentCreate._id,
      statusMessage,
    });
  }

  async function iugu(
    res,
    customerDB,
    paymentMethod,
    cart,
    cartItens,
    total,
    delivery,
    cartTotal,
    customer,
    coupon,
    couponPrice,
    tip,
    valueTip,
    typeSchedule,
    usedCashback,
    typePayment,
  ) {
    let isPhone = false;
    if (customerDB.person && customerDB.person.phone) {
      if (validator.isMobilePhone(`${customerDB.person.phone}`, "pt-BR")) {
        isPhone = true;
      }
    } else if (customerDB.phone) {
      if (validator.isMobilePhone(`${customerDB.phone}`, "pt-BR")) {
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

    if (customerDB.email && validator.isEmail(`${customerDB.email}`)) {
      isEmail = true;
    } else if (customerDB.person && customerDB.person.email && validator.isEmail(`${customerDB.person.email}`)) {
      isEmail = true;
    }

    if (isEmail === false) {
      return res.status(400).send({
        status: "error",
        message: "E-mail encontrado, vá até o Meu Perfil e informe um e-mail válido",
      });
    }

    const check = await Payment.findOne({ shoppingCart: cart._id }).sort({ createdAt: -1 }).lean();
    if (check && check.iugu_id && typePayment !== "PIX") {
      return iuguRetry(
        check,
        res,
        customerDB,
        paymentMethod,
        cart,
        cartItens,
        total,
        delivery,
        cartTotal,
        customer,
        coupon,
        couponPrice,
        tip,
        valueTip,
        typeSchedule,
        usedCashback,
      );
    }

    let paymentCreate = await Payment.create({
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
      typePayment: typePayment === "PIX" ? "PIX" : "IUGU",
      valueTip: tip,
      shoppingPaymentMethod: paymentMethod ? paymentMethod._id : null,
      usedCashback: usedCashback ? usedCashback : 0,
      freeShippingBonus: cartTotal.shippingInfo.free.toFixed(2),
      freeShippingBonusOrigin: cartTotal.shippingInfo.origin,
    });

    await debitPriceCompany(paymentCreate._id, cart);
    paymentCreate = await Payment.findById(paymentCreate._id);
    const payload = await payloadIugu(customerDB, paymentMethod, cart, cartItens, total, delivery, cartTotal, paymentCreate, typePayment);

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

    await Payment.updateOne(
      { _id: paymentCreate._id },
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
      { _id: customerDB._id },
      {
        iugu_id: dataResp.customer_id,
      },
    );

    await Payment.updateOne(
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

    if (paymentCreate && paymentCreate._id && dataResp.status === "paid") {
      await afterPayment(paymentCreate, dataResp, cart, delivery, valueTip, typeSchedule);
    }

    return res.send({
      provider: "iugu",
      status: status,
      paymentId: paymentCreate._id,
      statusMessage,
      ...dataResp.pix,
    });
  }

  async function iuguPix(
    res,
    customerDB,
    cart,
    cartItens,
    total,
    delivery,
    cartTotal,
    customer,
    coupon,
    couponPrice,
    tip,
    valueTip,
    typeSchedule,
    usedCashback,
    deliveryFree,
  ) {
    let isPhone = false;
    if (customerDB.person && customerDB.person.phone) {
      if (validator.isMobilePhone(`${customerDB.person.phone}`, "pt-BR")) {
        isPhone = true;
      }
    } else if (customerDB.phone) {
      if (validator.isMobilePhone(`${customerDB.phone}`, "pt-BR")) {
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

    if (customerDB.email && validator.isEmail(`${customerDB.email}`)) {
      isEmail = true;
    } else if (customerDB.person && customerDB.person.email && validator.isEmail(`${customerDB.person.email}`)) {
      isEmail = true;
    }

    if (isEmail === false) {
      return res.status(400).send({
        status: "error",
        message: "E-mail encontrado, vá até o Meu Perfil e informe um e-mail válido",
      });
    }

    const check = await Payment.findOne({ shoppingCart: cart._id }).sort({ createdAt: -1 }).lean();

    let paymentCreate = await Payment.create({
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
    paymentCreate = await Payment.findById(paymentCreate._id);
    const payload = await payloadIugu(customerDB, null, cart, cartItens, total, delivery, cartTotal, paymentCreate, "PIX");

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

    await Payment.updateOne(
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
      { _id: customerDB._id },
      {
        iugu_id: dataResp.customer_id,
      },
    );

    await Payment.updateOne(
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
    res,
    customerDB,
    paymentMethod,
    cart,
    cartItens,
    total,
    delivery,
    cartTotal,
    customer,
    coupon,
    couponPrice,
    tip,
    valueTip,
    typeSchedule,
    usedCashback,
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

    await Payment.updateOne(
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

  async function sales(payData) {
    try {
      const { data: response } = await paymentApi.post("/sales", payData);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        addDebug.payData = err.response.data;
      } else {
        addDebug.payData = {
          message: err.message,
          err: err,
        };
      }

      console.log("error sales", addDebug);
      logPayment(addDebug, "payment-cielo-respPayment");
      return false;
    }
  }

  // Fila de Processamento Split
  async function queueSplit(paymentId, payload, paymentDate) {
    try {
      await paymentApi.post("/queue-split", {
        payment: paymentId,
        payload,
        paymentDate,
      });
    } catch (err) {
      logPayment("fail-create-queue-split", err);
    }
  }

  // Aplicar desconto
  const getCoupon = async (idCoupon, company) => {
    try {
      if (!idCoupon) {
        return null;
      }

      let filter = {};
      filter._id = idCoupon;
      filter.status = true;
      filter.dateInit = {
        $lte: moment().utc().startOf("day").toDate(),
      };

      filter.dateFinish = {
        $gte: moment().utc().startOf("day").toDate(),
      };

      let responseCoupon = await CouponModel.findOne(filter).select({ price: 1 }).lean();
      if (!responseCoupon || !responseCoupon._id) {
        return null;
      }

      let response = await CompanyCoupon.findOne({
        coupon: responseCoupon._id,
        companies: {
          $in: [company],
        },
      }).lean();

      if (!response || !response._id) {
        return null;
      }

      return responseCoupon.price;
    } catch (err) {
      console.log("Fail", err);
      return null;
    }
  };

  const debitPriceCompany = async (paymentId, cart) => {
    try {
      const payload = {};

      const { fee } = await CompanyDelivery.findOne({
        company: cart.company._id,
        deletedAt: { $exists: false },
      });

      // Porcentagem da Franquia por empresa
      if (fee > 0) {
        payload.debitPrice = Number(cartTotal.subTotal * (Number(fee) / 100));
        payload.fee = fee;
      } else {
        payload.debitPrice = 0;
        payload.fee = 0;
      }

      // Porcentagem do Admin por Franquia
      if (cart.company && cart.company.franchise && payload.debitPrice > 0) {
        const respFranchise = await FranchiseModel.findById(cart.company.franchise)
          .select({
            percentService: 1,
          })
          .lean();

        if (respFranchise && respFranchise.percentService && respFranchise.percentService > 0) {
          payload.feeAdm = respFranchise.percentService;

          payload.debitPriceAdm = Number(payload.debitPrice * (Number(respFranchise.percentService) / 100));
        }
      } else {
        payload.debitPriceAdm = 0;
        payload.feeAdm = 0;
      }

      await Payment.updateOne({ _id: paymentId }, payload);
    } catch (err) {
      console.log("err debitPriceCompany", err);
      return 0;
    }
  };

  return {
    pay,
  };
}

module.exports = MakePaymentController;
