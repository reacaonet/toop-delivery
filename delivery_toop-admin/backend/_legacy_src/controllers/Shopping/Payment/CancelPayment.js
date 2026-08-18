const moment = require("moment");

/** Model */
const OrderStatus = require("../../../models/Shopping/order/orderStatusModel");
const ShoppingCart = require("../../../models/Shopping/CartModel");
const LogModel = require("../../../models/LogModel");
const DeliveryManModel = require("../../../models/DeliveryMan/DeliveryManModel");
const UpdateController = require("../../Shopping/order/status/UpdateController");

const chargeBack = require("./../../Finance/chargeback").chargeBack;

/** Service */
const database = require("../../../services/firebase");

/**
 * Cancelar Pagamentos que não foram possíveis encontrar Motorista
 * verificar a questão da capture - o cancelametno só pode ser possível quando o pagamento não é capturado
 * Pagamentos Capturados devem ser feito um estorno e não um cancelamento
 */
const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderResponse = await OrderStatus.findById(orderId)
      .populate("payment")
      .populate("company", { _id: 1 })
      .select({
        shoppingCart: 1,
        status: 1,
        order_number: 1,
        payment: 1,
        deliveryMan: 1,
        company: 1,
      })
      .lean();

    if (!orderResponse || !orderResponse._id || !orderResponse.company) {
      return res.status(404).send({
        message: "Order de Pagamento não encontrado",
      });
    }

    if (orderResponse.status === "CANCELED") {
      return res.status(400).send({
        message: "Ordem de Pagamento já foi estornada anteriormente",
      });
    }

    //dispatch, delivery_route, finished, canceled
    if (orderResponse.status === "DISPATCH" || orderResponse.status === "DELIVERY_ROUTE" || orderResponse.status === "FINISHED") {
      return res.send({
        status: 403,
        message: "Ordem de Pagamento não pode ser cancelada. Pedido em transito ou finalizado.",
      });
    }

    await OrderStatus.updateOne({ _id: orderId }, { status: "CANCELED" });
    await ShoppingCart.updateOne({ _id: orderResponse.shoppingCart }, { status: "canceled" });

    /** Liberar Motorista  */
    if (orderResponse.deliveryMan) {
      await DeliveryManModel.updateOne(
        { _id: orderResponse.deliveryMan },
        {
          flag: "FREE",
        },
      );
    }

    // Notificações
    await UpdateController.sendNotifications(orderId, "CANCELED"); // User
    await UpdateController.sendNotificationsCompany(orderResponse, "CANCELED"); // Company
    await realTimeStatus(orderId, "CANCELED", orderResponse.company);

    chargeBack(orderResponse.payment[0]);

    return res.status(200).send({
      orderStatus: orderResponse,
      cancel: [],
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Payment/CancelPayment.js',
    error: err?.message,
    method: 'cancelPayment',
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
      message: "Não foi possível cancelar pagamento",
      err: err.message,
    });
  }
};

const realTimeStatus = async (_id, status, companyId) => {
  try {
    await database
      .ref()
      .child(`${process.env.FIREBASE_PATH}order/${_id}`)
      .set({
        status,
        tracker: false,
        update: moment().format("DD/MM/YYYY HH:mm:ss"),
      });

    setTimeout(() => {
      try {
        database.ref(`${process.env.FIREBASE_PATH}chat/company/${companyId}`).remove();
        database.ref(`${process.env.FIREBASE_PATH}order/${_id}`).remove();
      } catch (err) {}
    }, 3000);
  } catch (err) {
   console.log(`Log de erro criado com sucesso.`);
}
};

const logCancel = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: "paymentCancel",
      originError: originError,
    });
  } catch (err) {
   console.log("Opps fail create log", err);
  }
};

module.exports = { cancelPayment };
