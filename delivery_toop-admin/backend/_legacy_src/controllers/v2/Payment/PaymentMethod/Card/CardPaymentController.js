/** Model */
const Cart = require("../../../../../models/Shopping/CartModel");
const DeliveryAddres = require("../../../../../models/Customer/DeliveryAddressModel");
const CustomerModel = require("../../../../../models/CustomerModel");
const Payment = require("../../../../../models/Shopping/PaymentModel");
const CompayDelivery = require("../../../../../models/Company/CompanyDeliveryModel");

const CompanyModel = require("../../../../../models/Company/CompanyModel");
const orderStatusModel = require("../../../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../../../models/LogModel");

/** Controller */
const OrderStatus = require("../../../../Shopping/order/status/CreateController");
const OrderTracking = require("../../../../Shopping/order/tracking/CreateController");

/* Service */
const PayTotal = require("../../PayTotal");
const getCoupon = require("../../GetCoupon");
const afterPayment = require("../../AfterPayment");

/* Util */
const validCreatePost = require("./validatePost");
const logPayment = require("../../util/logPayment");
const msgValidate = require("../../util/msgValidate");
const distanceKM = require("../../../../../utils/distanceCoordinate");
const { formatMoney } = require("../../../../../utils");

/* Variables */
let addDebug = {};
let cartTotal = {};
let total = 0; // Total da Fatura
let tip = null;
let typePayment = "CARD";
const valueMin = 0.09;

/**
 * url - /v2/payment/card-machine/send/cart/:cartId
 * POST
 * - customer
 */
const sendCardPayment = async (req, res) => {
  try {
    const msgValid = validCreatePost({ ...req.body, ...req.params });
    if (msgValid !== null) {
      logPayment({ message: msgValid }, "payment-not-valid");
      return res.status(400).send({
        status: "error",
        message: msgValid,
      });
    }

    addDebug.params = req.params;
    addDebug.body = req.body;

    const { cartId } = req.params;
    const { customer, ipAddress, coupon, valueTip, typePaymentId, typeSchedule, deliveryFree, usedCashback } = req.body;

    tip = null;

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
      return msgValidate.notFoundCardMsg(res, addDebug);
    }

    addDebug.body = req.cart;
    const delivery = await DeliveryAddres.findOne({
      customer,
      main: true,
    }).lean();

    if (!delivery || !delivery.address) {
      return msgValidate.notAddress(res, addDebug);
    }

    addDebug.body = req.delivery;
    const customerDB = await CustomerModel.findById(customer).populate("person").lean();

    if (!customerDB || !customerDB._id) {
      return msgValidate.notCustomer(res, addDebug);
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
    total = PayTotal.totalCart(cartTotal); // Total da fatura

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

    // Desconto do Cupom
    let couponPrice = await getCoupon(coupon, cart.company._id);
    total = discountCoupon(couponPrice, total);

    if (!total || total <= valueMin) {
      return msgValidate.totalZeroOrNegative(res, addDebug);
    }

    // Adicionar Gorjeta
    total = addTip(valueTip, total);
    addDebug.total = total;

    const payment = {
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
      capture: false,
      typePayment,
      valueTip: tip,
      typePaymentId,
      usedCashback: usedCashback ? usedCashback : 0,
      freeShippingBonus: cartTotal.shippingInfo.free.toFixed(2),
      freeShippingBonusOrigin: cartTotal.shippingInfo.origin,
      shippingInfo: cartTotal.shippingInfo.payload,
      status: "AWAITING_PAYMENT",
    };

    const newPayment = await Payment.create(payment);

    if (!newPayment || !newPayment._id) {
      return msgValidate.failToSave(res, addDebug);
    }

    const createOrder = await createOrderStatus(newPayment, delivery, typeSchedule);

    if (createOrder === false) {
      return msgValidate.failCreateOrder(res, addDebug);
    }

    orderTrack(createOrder, cart);
    afterPayment(newPayment, createOrder, cart, valueTip, cartTotal);

    return res.status(200).send({
      status: true,
      message: "Pedido Criado com Sucesso!!",
      typePayment,
      paymentId: newPayment._id,
      orderId: createOrder._id,
      status: 2,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Payment/PaymentMethod/Card/CardPaymentController.js',
      error: err?.message,
      method: 'sendCardPayment',
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

    logPayment(
      {
        err,
        message: err.message,
      },
      "error-payment-card-all",
    );
    return res.status(400).send({
      status: "error",
      message: "Não foi possível processar pagamento",
    });
  }
};

const discountCoupon = (couponPrice, total) => {
  if (couponPrice && couponPrice > 0) {
    total -= couponPrice;
  }

  return total;
};

// Gorjeta
const addTip = (valueTip, total) => {
  if (valueTip && parseFloat(`${valueTip}`) > 0) {
    let vTip = parseFloat(`${valueTip}`);
    total = total + vTip;
    tip = vTip;
  }

  return total;
};

const createOrderStatus = async (payment, delivery, typeSchedule) => {
  try {
    let companyDelivery = await CompayDelivery.findOne({
      company: payment.company,
      deletedAt: { $exists: false },
    }).lean();

    let idCompanyDelivery = null;
    if (companyDelivery && companyDelivery._id) {
      idCompanyDelivery = companyDelivery._id;
    }

    let order_number = Math.floor(1000 + Math.random() * 9000);

    const orderStatus = await OrderStatus.newOrder({
      payment: payment._id,
      company: payment.company,
      shoppingCart: payment.shoppingCart,
      customer: payment.customer,
      customerDelivery: delivery._id,
      companyDelivery: idCompanyDelivery,
      order_number: order_number,
      typePayment,
      typeSchedule,
    });

    await Payment.updateOne(
      { _id: payment._id },
      {
        order: orderStatus._id,
      },
    );

    return orderStatus;
  } catch (err) {
    logPayment(
      {
        err: err,
        message: err.message,
      },
      "Error-createOrderStatus",
    );
    return false;
  }
};

const orderTrack = async (payment, cart) => {
  try {
    await OrderTracking.newOrder({
      payment: payment._id,
      shoppingCart: cart._id,
      location: cart.company.location,
    });
  } catch (err) {
    logPayment(
      {
        err: err,
        message: err.message,
      },
      "Error-orderTrack",
    );
  }
};

module.exports = sendCardPayment;
