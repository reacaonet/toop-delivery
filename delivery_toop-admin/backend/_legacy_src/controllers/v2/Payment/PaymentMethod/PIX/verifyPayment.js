const mongoose = require("mongoose");

/** Model */
const CartModel = require("../../../../../models/Shopping/CartModel");
const PixGenerateModel = require("../../../../../models/Shopping/PixGenerateModel");
const DeliveryAddres = require("../../../../../models/Customer/DeliveryAddressModel");
const CustomerModel = require("../../../../../models/CustomerModel");
const Payment = require("../../../../../models/Shopping/PaymentModel");
const CompayDelivery = require("../../../../../models/Company/CompanyDeliveryModel");
const LogModel = require("../../../../../models/LogModel");
const OrderStatus = require("../../../../Shopping/order/status/CreateController");

/** Service */
const paymentApi = require("../../../../../services/paymentApi");
const getCoupon = require("../../GetCoupon");
const PayTotal = require("../../PayTotal");
const afterPayment = require("../../AfterPayment");

/* Variables */
let typePayment = "PIX";

const verifyPayment = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId || !mongoose.isValidObjectId(cartId)) {
      return res.status(400).send({
        message: "Carrinho inválido",
      });
    }

    const cart = await CartModel.findOne({
      _id: cartId,
      status: "pending",
    })
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

    const payment = await Payment.findOne({ shoppingCart: cartId, typePayment: "PIX" }).sort({ createdAt: -1 }).lean();

    if (!cart || !payment) {
      return res.status(400).send({
        message: "Carrinho não possui txid",
      });
    }

    let register = null;
    // let payment = null;
    const pix = await getStatusPix(payment.paymentProviderId);

    if (pix && pix.status && pix.status === "paid") {
      await registerPayment(cart, payment);
      register = true;
    }

    return res.status(200).send({
      payment: payment,
      register: register,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Payment/PaymentMethod/PIX/verifyPayment.js',
      error: err?.message,
      method: 'verifyPayment',
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

    console.log("all", err);
    return res.status(400).send({
      message: "Não foi possível verificar",
      err: err.message,
    });
  }
};

const getStatusPix = async txid => {
  try {
    const { data: response } = await paymentApi.get(`/iugu/transactions/${txid}`);

    if (!response) {
      return null;
    }

    return response;
  } catch (err) {
    console.log("falhou", err);
    return null;
  }
};

const registerPayment = async (cart, payment) => {
  try {
    if (!payment || !payment._id) {
      return null;
    }

    let coupon = payment.coupon ? payment.coupon : undefined;
    let valueTip = payment.valueTip ? payment.valueTip : undefined;
    let typeSchedule = payment.typeSchedule ? payment.typeSchedule : undefined;
    let deliveryFree = payment.deliveryFree ? payment.deliveryFree : false;

    // cobrar taxa de entrega ?
    let isDelivery = true;
    if (typeSchedule && typeSchedule == "WITHDRAWAL") {
      isDelivery = false;
    } else if (typeSchedule == "DELIVERY" && `${deliveryFree}` == "true") {
      isDelivery = false;
    }

    const delivery = await DeliveryAddres.findOne({
      customer: cart.customer,
      main: true,
      isDeleted: false,
    }).lean();

    const createOrder = await createOrderStatus(payment, delivery, typeSchedule);

    if (createOrder === false) {
      return false;
    }

    afterPayment(payment, createOrder, cart, valueTip);

    if (!createOrder) {
      return null;
    }

    return payment;
  } catch (err) {
    console.log("fail registerPayment", err);
    return null;
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
  }

  return total;
};

const createOrderStatus = async (payment, delivery, typeSchedule) => {
  try {
    let companyDelivery = await CompayDelivery.findOne({
      company: payment.company,
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
        status: "APPROVED",
      },
    );

    return orderStatus;
  } catch (err) {
    console.log("fail create order", err);
    return false;
  }
};

// --> atualiza o pagamento debitando a taxa adicional (pagamento presencial)
const debitPriceCompany = async (paymentId, cart) => {
  try {
    const { fee_local } = await CompayDelivery.findOne({
      company: cart.company._id,
    });

    if (fee_local > 0) {
      debitPrice = Number(cartTotal.subTotal * Number(fee_local / 100).toFixed(2));
    }

    await Payment.updateOne(
      { _id: paymentId },
      {
        debitPrice,
        feeDebitPrice: fee_local,
      },
    );
  } catch (err) {
    return 0;
  }
};

module.exports = verifyPayment;
