const mongoose = require("mongoose");
const moment = require("moment");
const OrderStatus = require("../../../../models/Shopping/order/orderStatusModel");
const Payment = require("../../../../models/Shopping/PaymentModel");
const User = require("../../../../models/UserModel");
const Customer = require("../../../../models/CustomerModel");
const QueueDeliveryMan = require("../../../../models/DeliveryMan/QueueDeliveryManModel");
const DeliveryMan = require("../../../../models/DeliveryMan/DeliveryManModel");
const Cart = require("../../../../models/Shopping/CartModel");
const Tip = require("../../../../models/TipModel");
const TipDeliveryMan = require("../../../../models/TipDeliveryManModel");
const Shopper = require("../../../../models/ShopperModel");
const ShoppingCart = require("../../../../models/Shopping/CartModel");
const ShoppingCartItem = require("../../../../models/Shopping/CartItemModel");
const FranchiseModel = require("../../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../../models/LogModel");

const chargeBack = require("./../../../Finance/chargeback").chargeBack;

/** Service */
const paymentApi = require("../../../../services/paymentApi");
const notificationApi = require("../../../../services/notification");
const database = require("../../../../services/firebase");
const newCharge = require("../../Payment/NewCharge/NewChargeController");
const updateTransationBank = require("./../../../../services/Finance/DigitalAccounts/updateTransation");
const sendEmail = require("../../../../services/email/send");

const deliveryInformationController = require("./../DeliveryInformationController");

/** utils */
const utils = require("./../../../../utils/");

const updateStatus = async (req, res) => {
  try {
    const { _id } = req.params;
    const { status, shopper, acceptedDateShopper, acceptedDateDeliveryMan, finishDateDeliveryMan, deliveryMan } = req.body;

    let dataUpdate = {};

    if (!mongoose.isValidObjectId(_id)) {
      return res.status(400).send({
        message: "Informe uma Order válido!!",
      });
    }

    let orderStatus = await OrderStatus.findById(_id)
      .populate("shoppingCart", {
        schedule: 1,
      })
      .populate("company")
      .populate("payment")
      .lean();

    if (!status) {
      return res.status(400).send({
        message: "Status inválido...",
      });
    }

    if (!orderStatus) {
      return res.status(400).send({
        message: "Order não encontrado...",
      });
    }

    if (orderStatus.status === "CANCELED") {
      return res.status(400).send({
        message: "Não é possível modificar, este pedido se encontra cancelado",
      });
    }

    if (orderStatus.status === "FINISHED") {
      return res.status(400).send({
        message: "Não é possível modificar, este pedido se encontra finalizado",
      });
    }

    if (status === "ACCEPT_SHOPPER" && orderStatus.status !== "WAIT_COMPANY") {
      return res.status(400).send({
        message: "Pedido já foi aceito, anteriormente ...",
      });
    }

    if (status === "ACCEPT_SHOPPER" && !shopper) {
      return res.status(400).send({
        message: "Informe um shopper",
      });
    }

    dataUpdate.status = status;
    if (shopper) {
      dataUpdate.shopper = shopper;
    }

    if (acceptedDateShopper) {
      // dataUpdate.acceptedDateShopper = acceptedDateShopper;
      dataUpdate.acceptedDateShopper = moment().utc(false).toDate();
    }

    if (acceptedDateDeliveryMan) {
      // dataUpdate.acceptedDateDeliveryMan = acceptedDateDeliveryMan;
      dataUpdate.acceptedDateDeliveryMan = moment().utc(false).toDate();
    }

    if (finishDateDeliveryMan) {
      // dataUpdate.finishDateDeliveryMan = finishDateDeliveryMan;
      dataUpdate.finishDateDeliveryMan = moment().utc(false).toDate();
    }

    if (deliveryMan) {
      dataUpdate.deliveryMan = deliveryMan;
    }

    if (status === "ACCEPT_DELIVERYMAN" && orderStatus.deliveryMan) {
      return res.status(400).send({
        message: "Este pedido já foi aceito!!",
      });
    }

    let shoppingCart = orderStatus.shoppingCart;

    // verificar e modificar valor do payment - supermarket
    // if (orderStatus.company && orderStatus.company.type === "supermarket" && (status === "DISPATCH" || status === "WAIT_DELIVERYMAN")) {
    //   let respNewCharge = await newCharge(orderStatus);
    //   if (!respNewCharge || respNewCharge.status === false) {
    //     return res.status(400).send({
    //       message: respNewCharge.message,
    //     });
    //   }
    // }

    const statusOrder = await OrderStatus.findOneAndUpdate({ _id: _id }, dataUpdate, {
      new: true,
      upsert: true,
    });

    removeNewOrder(orderStatus);

    // Quando for despachado para procurar motorista - Entrar na Fila de Processamento
    if (status === "WAIT_DELIVERYMAN") {
      queueDeliveryMan(orderStatus);
    }

    if (status === "DISPATCH") {
      queueSplitDispatch(orderStatus);
    }

    if (status === "ACCEPT_DELIVERYMAN" && dataUpdate.deliveryMan) {
      acceptedByDeliveryMan(orderStatus._id, dataUpdate.deliveryMan);
    }

    if (status === "FINISHED" && orderStatus.deliveryMan) {
      releaseDeliveryMan(orderStatus._id, orderStatus.deliveryMan);
      insertTipDeliveryMan(orderStatus);

      //atualiza a atransação bancária como COMPLETED
      updateTransationBank.byCode(orderStatus.transactionCode, {
        status: "COMPLETED",
      });
    }

    if (status === "FINISHED") {
      await cartPurchase(shoppingCart);

      //atualiza a atransação bancária como COMPLETED
      updateTransationBank.byCode(orderStatus.transactionCode, {
        status: "COMPLETED",
      });

      sendCompletionEmail(orderStatus);
    }

    if (status === "CANCELED") {
      await ShoppingCart.updateOne({ _id: shoppingCart }, { status: "canceled" });

      //atualiza a atransação bancária como CANCELED
      updateTransationBank.byCode(orderStatus.transactionCode, {
        status: "CANCELED",
      });

      if (orderStatus.payment) {
        chargeBack(orderStatus.payment[0]._id);
      }
    }

    // Real Time Change Status
    realTimeStatus(_id, shoppingCart, status, orderStatus.company._id);

    // Notificações Customer
    sendNotifications(_id, status, orderStatus);

    // Notificações Company -> Shopper
    sendNotificationsCompany(orderStatus, status);

    return res.status(200).send(statusOrder);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/order/status/UpdateController.js',
      error: err?.message,
      method: 'updateStatus',
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
      message: err.message,
    });
  }
};

const removeNewOrder = async orderStatus => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}newOrder/${orderStatus.company._id}`).remove();
  } catch (err) {

  }
};

const insertTipDeliveryMan = async orderStatus => {
  try {
    const cart = await Cart.findById(orderStatus.shoppingCart);

    if (!cart) {
      return;
    }

    const tip = await Tip.findOne(orderStatus.shoppingCart);

    if (!tip) {
      return;
    }

    await TipDeliveryMan.create({
      orderStatus,
      deliveryMan: orderStatus.deliveryMan,
      tip,
      value: tip.value,
    });
  } catch (err) {
    console.log("Fail insertTipDeliveryMan", err);
  }
};

const OrderStatusText = status => {
  try {
    if (status === "WAIT_COMPANY") {
      return "Seu pedido foi enviado ao estabelecimento";
    }

    if (status === "SCHEDULED") {
      return "Pedido Agendado com sucesso!!";
    }

    if (status === "ACCEPT_SHOPPER") {
      return "O estabelecimento recebeu o seu pedido";
    }

    if (status === "IN_PREPARATION") {
      return "Estamos preparando o seu pedido";
    }

    // if (status === "ACCEPT_DELIVERYMAN") {
    //   return "O entregador está buscando o seu pedido";
    // }

    if (status === "DELIVERY_ROUTE") {
      return "Seu pedido está indo até você";
    }

    if (status === "DISPATCH") {
      return "Seu pedido está indo até você";
    }

    if (status === "FINISHED") {
      return "Entrega realizada. Bom apetite!";
    }

    if (status === "CANCELED") {
      return "O estabelecimento cancelou seu pedido";
    }

    return false;
  } catch (err) {
    return false;
  }
};

// utilizado também em -> /payment/cancel/order/
const sendNotifications = async (orderId, status, orderOld) => {
  try {
    let message;
    let orderStatus = await OrderStatus.findById(orderId).lean();
    let customer = await Customer.findById(orderStatus.customer).lean();
    // let listShopper = await Shopper.findOne({ company: orderStatus.company });
    if (!customer) {
      return;
    }

    if (status) {
      let statusShedule = status;

      if (orderOld.shoppingCart && orderOld.shoppingCart.schedule && orderOld.shoppingCart.schedule.deliveryDate) {
        statusShedule = "SCHEDULED";
      }

      message = OrderStatusText(statusShedule);

      if (message) {
        await notificationApi.post(`/v1/app-notification/user/${customer.device}`, {
          user: {
            auth: customer.token,
            message: message,
          },
        });
      }
    }

    // await notificationApi.post(`/v1/app-notification/user/${listShopper.person}`, {
    //   user: {
    //     auth: listShopper.token,
    //     message: message,
    //   },
    // });

    if (status === "WAIT_COMPANY") {
      await warnDefinedList(orderStatus);
    }
  } catch (err) {
    let error = err.message;
    if (err.response && err.response.data) {
      error = err.response.data;
    }

    console.log("Fail List Send notification", error);
  }
};

// utilizado também em -> /payment/cancel/order/
const sendNotificationsCompany = async (orderStatus, status) => {
  try {
    let statusShedule = status;
    if (orderStatus.shoppingCart && orderStatus.shoppingCart.schedule && orderStatus.shoppingCart.schedule.deliveryDate) {
      statusShedule = "SCHEDULED";
    }

    let txtStatus = OrderStatusText(statusShedule);

    await database
      .ref()
      .child(`${process.env.FIREBASE_PATH}order/company/${orderStatus.company._id}`)
      .set({
        status,
        txtStatus: txtStatus,
        number: orderStatus.order_number,
        update: moment().format("DD/MM/YYYY HH:mm:ss"),
      });

    setTimeout(async () => {
      try {
        await database.ref(`${process.env.FIREBASE_PATH}order/company/${orderStatus.company._id}`).remove();
      } catch (err) { }
    }, 5000);
  } catch (err) {
    console.log("Fail sendNotificationsCompany", err);
  }
};

const realTimeStatus = async (_id, shoppingCart, status, companyId) => {
  try {
    await database
      .ref()
      .child(`${process.env.FIREBASE_PATH}order/${_id}`)
      .set({
        status,
        tracker: false,
        update: moment().format("DD/MM/YYYY HH:mm:ss"),
      });

    if (status === "FINISHED" || status === "CANCELED") {
      setTimeout(async () => {
        try {
          await database.ref(`${process.env.FIREBASE_PATH}order/${_id}`).remove();
          if (companyId) {
            await database.ref(`${process.env.FIREBASE_PATH}chat/company/${companyId}`).remove();
          }
          // Código abaixo mantido por ser usado abaixo das versões 1.0.45
          await database.ref(`${process.env.FIREBASE_PATH}chat/cart/${shoppingCart}`).remove();
        } catch (err) { }
      }, 5000);
    }
  } catch (err) {
    console.log("Fail RealTime", err.message);
  }
};

const queueDeliveryMan = async orderStatus => {
  try {
    const payload = {
      order: orderStatus._id,
      company: orderStatus.company._id,
      locationCompany: orderStatus.company.location,
    };

    if (orderStatus && orderStatus.typeOfVehicle) {
      payload.typeOfVehicle = orderStatus.typeOfVehicle;
    }

    // entregadores exclusivas para esta empresa
    const listDeliveryMan = await DeliveryMan.find({
      companyService: orderStatus.company._id,
    })
      .select({
        _id: 1,
      })
      .lean();

    if (listDeliveryMan && Array.isArray(listDeliveryMan) && listDeliveryMan.length > 0) {
      const sendToListDeliveryMan = listDeliveryMan.map(item => {
        return item._id;
      });

      payload.sendToListDeliveryMan = sendToListDeliveryMan;
    }

    let resp = await QueueDeliveryMan.create(payload);

    if (!resp) {
      console.log("Fail create queue DeliveryMan");
    }
  } catch (err) {
    console.log(`Log de erro criado com sucesso.`);

    console.log("Error", err.message);
  }
};

// Aceito e modificado para não pegar outra corrida até finalizar
const acceptedByDeliveryMan = async (orderId, deliveryManId) => {
  try {
    const queue = await QueueDeliveryMan.findOne({ order: orderId }).select({ _id: 1 }).lean();

    if (queue && queue._id) {
      await DeliveryMan.updateOne({ _id: deliveryManId }, { flag: "ON_ROUTE", queueDeliveryMan: queue._id });

      await QueueDeliveryMan.updateOne(
        { order: orderId },
        {
          deliveryMan: deliveryManId,
        },
      );
    }

    // console.log('Motorista colocado como em rota ....');
  } catch (err) {
    console.log("Fail Update Order Status acceptedByDeliveryMan", err.message);
  }
};

const releaseDeliveryMan = async (orderId, deliveryManId) => {
  try {
    const queue = await QueueDeliveryMan.findOne({ order: orderId }).select({ _id: 1 }).lean();

    if (queue && queue._id) {
      await DeliveryMan.updateOne(
        { _id: deliveryManId },
        {
          flag: "FREE",
          queueDeliveryMan: queue._id,
        },
      );
    }
  } catch (err) {
    console.log("Fail releaseDeliveryMan", err.message);
  }
};

/**
 * marca Carrinho como Finalizado
 * Liberado para nova compra neste estabelecimento
 */
const cartPurchase = async cartId => {
  try {
    const data = { status: "purchaded" };
    await Cart.updateOne({ _id: cartId }, data);
  } catch (err) {
    console.log("Error update status", err.message);
  }
};

// Gambiarra pedida pelo maurício
const warnDefinedList = async orderStatus => {
  try {
    let listEmails = ["samuelfrc@hotmail.com", "plantao1@ebr.com", "plantao2@ebr.com", "plantao3@ebr.com", "plantao4@ebr.com"];

    let list = await User.find({ email: { $in: listEmails } })
      .select({ person: 1 })
      .limit(5)
      .lean();

    let listPerson = list.map(item => {
      return mongoose.Types.ObjectId(item.person);
    });

    // Tokens para envio
    const listShopper = await Shopper.find({ person: { $in: listPerson } })
      .select({ token: 1 })
      .lean();

    if (!listShopper) {
      return;
    }

    for await (const item of listShopper) {
      try {
        await notificationApi.post(`/v1/app-notification/user/${listShopper.person}`, {
          user: {
            auth: item.token,
            message: `Novo Pedido ${orderStatus.order_number}`,
          },
        });
      } catch (err) {
        console.log("warnDefinedList", err);
      }
    }
  } catch (err) {
    console.log("Oops warnDefinedList", err);
  }
};

const queueSplitDispatch = async orderStatus => {
  try {
    let idPayments = orderStatus.payment;
    let payment = await Payment.findOne({
      _id: idPayments,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!payment || !payment._id || payment.typePayment === "BRASPAG") {
      return;
    }

    let payload = payment.payload || {};
    let { data: paymentResponse } = await paymentApi.post("/queue-split", {
      payment: payment._id,
      payload: payload,
      paymentDate: payment.createdAt,
      status: "PROCESS",
      phase: "DISPATCH",
    });

    return true;
  } catch (err) {
    console.log("queueSplitDispatch Error", err);
    return false;
  }
};

const sendCompletionEmail = async orderStatus => {
  let listUser = await User.find({ company: orderStatus.company._id }).select({ _id: 1, token: 1, name: 1, email: 1 }).lean();

  // let orderStatus = await OrderStatus.findById(orderId).lean();
  let customer = await Customer.findById(orderStatus.customer._id).populate("person").lean();
  let franchise = await FranchiseModel.findById(orderStatus.company.franchise).lean();

  // itens
  const itens = await ShoppingCartItem.find({ shoppingCart: orderStatus.shoppingCart._id });

  let itensHtml = "";
  if (itens) {
    itensHtml = itens.map(
      item =>
        `<p><strong>${item.name}</strong> x<strong>${item.amount}</strong> = <strong>${utils.formatMoney(
          (item.pricePromotion ? item.pricePromotion : item.price) * item.amount,
        )}</strong></p>`,
    );
  }

  const variables = [
    {
      "{{franquia_nome}}": franchise.name,
    },
    {
      "{{cliente_nome}}": customer.person.name,
    },
    {
      "{{cliente_cpf}}": customer.person.cpf,
    },
    {
      "{{cliente_email}}": customer.person.email,
    },
    {
      "{{empresa_nome}}": orderStatus.company.name,
    },
    {
      "{{empresa_endereco}}": orderStatus.company.address,
    },
    {
      "{{usuario_email}}": "",
    },
    {
      "{{usuario_nome}}": "",
    },
    {
      "{{pedido_data}}": moment(orderStatus.createdAt).utc().subtract(3, "hours").format("DD/MM/YYYY HH:mm"),
    },
    {
      "{{pedido_numero}}": orderStatus.order_number,
    },
    {
      "{{pedido_status}}": await OrderStatusText(orderStatus.status),
    },
    {
      "{{pedido_valor}} ": orderStatus.payment && orderStatus.payment.length > 0 ? utils.formatMoney(orderStatus.payment[0].total) : "-",
    },
    {
      "{{pedido_forma_de_pagamento}}": (await deliveryInformationController.typePaymentPayload(orderStatus)).type,
    },
    {
      "{{pedido_itens}}": itensHtml,
    },
  ];

  if (customer.person && customer.person.email) {
    sendEmail(customer.person.email, "", "", variables, "email-order-finished-cliente", "order-completed-client", franchise._id);
  }
};

module.exports = { updateStatus, sendNotificationsCompany, sendNotifications };
