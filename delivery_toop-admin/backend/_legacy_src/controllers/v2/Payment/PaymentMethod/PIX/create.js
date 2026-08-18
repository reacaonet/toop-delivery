const moment = require("moment");
const mongoose = require("mongoose");

/** Model */
const cartModel = require("../../../../../models/Shopping/CartModel");
const CustomerModel = require("../../../../../models/CustomerModel");
const DeliveryAddres = require("../../../../../models/Customer/DeliveryAddressModel");
const PixGenerateModel = require("../../../../../models/Shopping/PixGenerateModel");
const LogModel = require("../../../../../models/LogModel");

/** Service */
const PayTotal = require("../../PayTotal");
const paymentApi = require("../../../../../services/paymentApi");
const getCoupon = require("../../GetCoupon");

/** Util */
const distanceKM = require("../../../../../utils/distanceCoordinate");
const msgValidate = require("../../util/msgValidate");
const { formatMoney } = require("../../../../../utils");

/* Variables */
let addDebug = {};
let cartTotal = {};
let total = 0; // Total da Fatura
let tip = null;
let typePayment = "PIX";
const valueMin = 0.0;

const createCharge = async (req, res) => {
  try {
    const { cartId, customerId, cpf, coupon, valueTip, typeSchedule, deliveryFree } = req.body;

    tip = null;
    addDebug = {};
    addDebug.params = req.params;
    addDebug.body = req.body;

    if (!cartId || !mongoose.isValidObjectId(cartId)) {
      return res.status(400).send({
        status: "error",
        message: "Informe um carrinho válido",
      });
    }

    if (!customerId || !mongoose.isValidObjectId(customerId)) {
      return res.status(400).send({
        status: "error",
        message: "Usuário não identificado",
      });
    }

    // if (cpf && `${cpf}`.replace(/([^0-9]+)/gi, "").length < 11) {
    //   return res.status(400).send({
    //     status: "error",
    //     message: "Informe um cpf válido",
    //   });
    // }

    const isCart = await cartModel
      .findOne({
        _id: cartId,
        customer: customerId,
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
    if (!isCart || !isCart._id) {
      return res.status(400).send({
        status: "error",
        message: "Carrinho não encontrado",
      });
    }

    const customer = await CustomerModel.findOne({
      _id: customerId,
    })
      .select({
        person: 1,
      })
      .populate("person", {
        name: 1,
        email: 1,
      })
      .lean();
    if (!customer || !customer.person) {
      return res.status(400).send({
        status: "error",
        message: "Cliente não encontrado",
      });
    }
    if (!customer.person.name) {
      return res.status(400).send({
        status: "error",
        message: "Nome não informado",
      });
    }
    // if (!customer.person.email) {
    //   return res.status(400).send({
    //     status: "error",
    //     message: "E-mail não informado",
    //   });
    // }

    const delivery = await DeliveryAddres.findOne({
      customer: customerId,
      main: true,
    }).lean();
    if (!delivery || !delivery.address) {
      return msgValidate.notAddress(res, addDebug);
    }
    // Distancia máxima de entrega
    if (
      isCart.company &&
      isCart.company.companyDelivery &&
      isCart.company.companyDelivery.max_distance &&
      isCart.company.companyDelivery.max_distance > 0 &&
      typeSchedule !== "WITHDRAWAL"
    ) {
      let km = distanceKM(
        {
          latitude: isCart.company.location.coordinates[1],
          longitude: isCart.company.location.coordinates[0],
        },
        {
          latitude: delivery.location.coordinates[1],
          longitude: delivery.location.coordinates[0],
        },
      );

      let maxDistance = isCart.company.companyDelivery.max_distance / 1000;
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
    cartTotal = await PayTotal.priceCart(isCart._id, isCart.company, isDelivery); // Informações do Carrinho
    total = PayTotal.totalCart(cartTotal); // Total da fatura

    // Valor mínimo do pedido
    if (
      isCart.company &&
      isCart.company.companyDelivery &&
      isCart.company.companyDelivery.min_purchase &&
      isCart.company.companyDelivery.min_purchase > 0 &&
      isCart.company.companyDelivery.min_purchase > cartTotal.subTotal
    ) {
      let difTotal = isCart.company.companyDelivery.min_purchase - cartTotal.subTotal;

      return res.status(400).send({
        status: "error",
        message: `Valor mínimo para compra neste estabelecimento é de ${formatMoney(isCart.company.companyDelivery.min_purchase)}, faltam ${formatMoney(
          difTotal,
        )} para completar o pedido mínimo`,
        minPurchase: isCart.company.companyDelivery.min_purchase,
        subTotal: cartTotal.subTotal,
      });
    }
    // Desconto do Cupom
    let couponPrice = await getCoupon(coupon, isCart.company._id);
    total = discountCoupon(couponPrice, total);

    if (!total || total <= valueMin) {
      return msgValidate.totalZeroOrNegative(res, addDebug);
    }

    // Adicionar Gorjeta
    total = addTip(valueTip, total);
    addDebug.total = total;
    // Gerar Cobrança PIX
    const generate = await generateCharge(total.toFixed(2));

    if (!generate || generate.message) {
      return res.status(400).send({
        status: "error",
        message: generate.message ? generate.message : "Não foi possível gerar o PIX por favor tente mais tarde",
      });
    }

    // Atualizar Carrinho
    await cartModel.updateOne(
      { _id: cartId },
      {
        pixTxid: generate.id,
        pixDate: moment().utc(false).toDate(),
      },
    );

    // Gerar Histórico de PIX
    await PixGenerateModel.create({
      shoppingCart: cartId,
      txid: generate.id,
      qrcode: generate.pix_qr_code,
      response: generate,
      deliveryFree,
    });

    return res.status(200).send({
      txid: generate.id,
      qrcode: generate.pix_qr_code,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Payment/PaymentMethod/PIX/create.js',
      error: err?.message,
      method: 'createCharge',
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

    console.log("fail pix", err);

    return res.status(400).send({
      message: "Não foi possível gerar cobrança",
      err: err.message,
    });
  }
};

const generateCharge = async value => {
  try {
    let total = Number((Number(value) * 100).toFixed(2));

    const { data: response } = await paymentApi.post(`/pagar-me/pix`, {
      amount: total,
    });

    if (!response || !response.id || !response.pix_qr_code) {
      return {
        message: "Não foi possível gerar PIX, por favor tente mais tarde",
      };
    }

    return response;
  } catch (err) {
    let errPayload = err;

    if (errPayload.response && errPayload.response.data) {
      errPayload = errPayload.response.data;
    } else if (errPayload.response) {
      errPayload = errPayload.response;
    }

    console.log("generateCharge err", errPayload);
    return {
      message: "Não foi possível gerar PIX verifique as informações enviadas",
    };
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

module.exports = createCharge;
