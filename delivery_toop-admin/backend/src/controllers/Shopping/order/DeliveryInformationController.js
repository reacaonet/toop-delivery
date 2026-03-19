/* LIBS */
const moment = require("moment");

/* MODEL */
const Order = require("../../../models/Shopping/order/orderStatusModel");
const Payment = require("../../../models/Shopping/PaymentModel");
const LogModel = require("../../../models/LogModel");

/* UTIL */
const Util = require("../../../utils");

const deliveryInformation = async (req, res) => {
  try {
    const { order } = req.params;

    const response = await Order.findById(order)
      .populate("shoppingCart", {
        status: 1,
        schedule: 1,
        tip: 1,
      })
      .populate("company", {
        companyCategory: 1,
      })
      .populate("customerDelivery")
      .populate("shoppingPaymentMethod", {
        flag: 1,
        cartNumber: 1,
      })
      .select({
        status: 1,
        typePayment: 1,
        typeSchedule: 1,
        payment: 1,
        shoppingPaymentMethod: 1,
      })
      .lean();

    if (!response) {
      return res.status(200).send(response);
    }

    if (response.shoppingCart && response.shoppingCart.schedule) {
      response.schedule = schedule(response.shoppingCart.schedule);
    }

    response.statusTxt = await statusTxt(response);
    response.paymentType = await typePaymentPayload(response);
    response.statusPayment = statusPayment(response);

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/DeliveryInformationController.js',
      error: err?.message,
      method: 'deliveryInformation',
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

    return res.status(400).send({
      message: "Não foi possível listar dados",
      err: err.message,
    });
  }
};

const statusTxt = async order => {
  try {
    if (order.company && order.company.companyCategory && order.company.companyCategory === "service" && order.typeSchedule === "DELIVERY") {
      return "Visita do Prestador";
    }

    if (order.company && order.company.companyCategory && order.company.companyCategory === "service" && order.typeSchedule === "WITHDRAWAL") {
      return "Marcar no Local";
    }

    if (
      (order.status === "WAIT_COMPANY" || order.status === "IN_PREPARATION") &&
      order.shoppingCart &&
      order.shoppingCart.schedule &&
      order.shoppingCart.schedule.deliveryDate &&
      order.typeSchedule === "DELIVERY"
    ) {
      return "Agendado";
    }

    if (
      (order.status === "WAIT_COMPANY" || order.status === "IN_PREPARATION") &&
      order.shoppingCart &&
      order.shoppingCart.schedule &&
      order.shoppingCart.schedule.deliveryDate &&
      order.typeSchedule === "WITHDRAWAL"
    ) {
      return "Retirar no local";
    }

    switch (order.status) {
      case "WAIT_COMPANY":
        return "Aguardando Confirmação";
      case "ACCEPT_SHOPPER":
        return "Aceito";
      case "IN_PREPARATION":
        return "Em Preparação";
      case "FINISH_PREPARATION":
        return "Preparação concluída";
      case "WAIT_DELIVERYMAN":
        return "Aguardando Entregador";
      case "ACCEPT_DELIVERYMAN":
        return "Aceito Entregador";
      case "IN_PROGRESS_DELIVERYMAN":
        return "Pedido aguardando entregador";
      case "RELEASE_SHOPPER":
        return "Pedido já está com entregador";
      case "DELIVERY_ROUTE":
        return "Em rota de entrega";
      case "DISPATCH":
        return "Pedido já está com entregador";
      case "FINISHED":
        return "Finalizado";
      case "CANCELED":
        return "Cancelado";
      default:
        return "";
    }
  } catch (err) {
    return "";
  }
};

const typePaymentPayload = async order => {
  try {
    let payload = {};

    if (order.typePayment === "BRASPAG" || order.typePayment === "PAGARME") {
      payload.type = "Pago Aplicativo";
      payload.data = "";

      if (order.shoppingPaymentMethod && order.shoppingPaymentMethod.cartNumber) {
        payload.data = "Credito " + order.shoppingPaymentMethod.cartNumber.slice(-6);
      }
    } else if (order.typePayment === "PIX") {
      payload.type = "PIX";
      payload.data = "";
    } else if (order.typePayment === "PIX_DIRECT") {
      payload.type = "Tranferência PIX";
      payload.data = "";
    } else if (order.typePayment === "MONEY") {
      payload.type = "Pagar em dinheiro";
      payload.data = "";

      let response = await Payment.findOne({ _id: order.payment })
        .select({
          cashChange: -1,
        })
        .lean();

      if (response && response._id && response.cashChange) {
        payload.data = `Troco para ${Util.formatMoney(response.cashChange)}`;
      }
    } else if (order.typePayment === "CARD") {
      payload.type = "Pagar com cartão na entrega";
      payload.data = "";

      if (order.payment && order.payment.length > 0) {
        let response = await Payment.findOne({ _id: order.payment })
          .populate("typePaymentId")
          .select({
            typePaymentId: 1,
          })
          .lean();

        if (response && response.typePaymentId && response.typePaymentId._id) {
          payload.data = `${response.typePaymentId.name}`;
          payload.image = response.typePaymentId.image[0];
        }
      }
    } else {
      payload.type = order.typePayment ? order.typePayment : "";
      payload.data = "";
    }

    return payload;
  } catch (err) {
    // console.log('falhou', err);
    return {};
  }
};

const schedule = item => {
  try {
    let startHour = `${item.startHour}`;
    let endHour = `${item.endHour}`;

    let scheduleDate = moment(item.deliveryDate).utc().subtract(3, "hours").format("DD/MM");

    startHour = startHour.slice(0, startHour.length > 3 ? 2 : 1) + ":" + startHour.slice(startHour.length > 3 ? 2 : 1, 5);
    endHour = endHour.slice(0, endHour.length > 3 ? 2 : 1) + ":" + endHour.slice(endHour.length > 3 ? 2 : 1, 5);

    if (moment(item.deliveryDate).isSame(moment(), "day")) {
      return `Hoje as ${startHour} até ${endHour}`;
    }

    return `${scheduleDate} das ${startHour} até ${endHour}`;
  } catch (err) {
    return null;
  }
};

const statusPayment = order => {
  try {
    if (order.typePayment) {
      return "Pago pelo aplicativo";
    }

    if (order.typePayment === "MONEY" || order.typePayment === "CARD") {
      return "Pagar ao retirar";
    }

    return "";
  } catch (err) {
    return "";
  }
};

module.exports = { deliveryInformation, typePaymentPayload, statusTxt };
