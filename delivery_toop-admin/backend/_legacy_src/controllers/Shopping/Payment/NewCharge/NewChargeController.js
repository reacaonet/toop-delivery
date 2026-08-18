const CartItem = require("../../../../models/Shopping/CartItemModel");
const Payment = require("../../../../models/Shopping/PaymentModel");
const LogModel = require("../../../../models/LogModel");

/** Service */
const { createPayment, partialChargeback } = require("./NewChargeBraspag");
const createOtherPayment = require("./NewChargeOtherPayment");

let alterShopper = [];
let currentCart = [];

const newCharge = async order => {
  try {
    if (!order || !order.shoppingCart || !order.payment) {
      return {
        status: false,
        message: "Informe uma ordem válida",
      };
    }

    if (order.status === "FINISHED" || order.status === "CANCELED" || order.status === "WAIT_COMPANY") {
      return {
        status: false,
        message: "Verifique o status do pedido, não é possível alterar valor",
      };
    }

    const shoppingCart = order.shoppingCart;
    const paymentId = order.payment[order.payment.length - 1];

    let payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      return {
        status: false,
        message: "Não existe um pagamento vinculado",
      };
    }

    let cartItens = await CartItem.find({ shoppingCart }).lean();

    if (!cartItens) {
      return {
        status: false,
        message: "Nenhum item vinculado ao carrinho",
      };
    }

    await getCart(cartItens);

    // if (alterShopper.length === 0) {
    //   return {
    //     status: true,
    //     message: 'Nenhum produto Alterado'
    //   }
    // }

    let total = await getTotal(payment);

    let response = {
      status: false,
      message: "Não foi possível processar solicitação",
    };

    if (order.typePayment === "BRASPAG") {
      response = await braspag(total, payment);
    } else if (order.typePayment === "MONEY" || order.typePayment === "CARD") {
      response = await moneyOrMachineCard(total, payment, order);
    } else {
      return {
        status: true,
        message: "Sem Alteração no Valor",
      };
    }

    return response;
  } catch (err) {
    return {
      status: false,
      message: "Não foi possível realizar uma nova cobrança",
      err: err.message,
    };
  }
};

const braspag = async (total, payment) => {
  if (total.dif < 0) {
    return await partialChargeback(payment, Math.abs(total.dif)); // Realizar Estorno
  } else if (total.dif > 0) {
    return await createPayment(payment, total.dif); // Realizar uma nova cobrança com a diferença
  } else if (total.dif === 0) {
    return {
      status: true,
      message: "Sem Alteração no Valor",
    };
  }
};

const moneyOrMachineCard = async (total, payment, order) => {
  if (total.dif < 0) {
    return createOtherPayment(order, payment, -Math.abs(total.dif));
  } else if (total.dif > 0) {
    return createOtherPayment(order, payment, Math.abs(total.dif));
  } else if (total.dif === 0) {
    return {
      status: true,
      message: "Sem Alteração no Valor",
    };
  }
};

const getCart = async cartItens => {
  alterShopper = [];
  currentCart = [];

  for await (const item of cartItens) {
    if (item.isDeleted === true && item.shopper) {
      alterShopper.push(item);
    } else if (item.isDeleted === false) {
      currentCart.push(item);
    }
  }

  return;
};

const getTotal = async payment => {
  let totalCompany = 0;

  // Todos os Pagamentos para este pedido com Status Aprovado
  let listTotalCompany = await Payment.find({
    shoppingCart: payment.shoppingCart,
    status: {
      $in: ["APPROVED", "AWAITING_PAYMENT"],
    },
  })
    .select({
      totalCompany: 1,
      partialChargeback: 1,
    })
    .lean();

  let partialChargeback = 0;

  for (const total of listTotalCompany) {
    totalCompany += total.totalCompany;

    if (total.partialChargeback && total.partialChargeback > 0) {
      partialChargeback += total.partialChargeback;
    }
  }

  let cartTotal = 0;

  for await (const item of currentCart) {
    if (item.pricePromotion && item.pricePromotion > 0) {
      cartTotal += item.amount * item.pricePromotion;
    } else if (item.price && item.price > 0) {
      cartTotal += item.amount * item.price;
    }
  }

  let dif = cartTotal - totalCompany + partialChargeback;
  dif = parseFloat(dif.toFixed(2));

  return {
    totalCompany,
    cartTotal,
    dif,
  };
};

module.exports = newCharge;
