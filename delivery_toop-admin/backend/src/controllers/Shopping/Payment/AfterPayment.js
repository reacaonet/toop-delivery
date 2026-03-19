const Cart = require("../../../models/Shopping/CartModel");
const OrderStatus = require("../order/status/CreateController");
const CompayDelivery = require("../../../models/Company/CompanyDeliveryModel");

const OrderTracking = require("../order/tracking/CreateController");
const Shopper = require("../../../models/ShopperModel");
const notificationApi = require("../../../services/notification");
const database = require("../../../services/firebase");
const logPayment = require("./util/logPayment");
const Tip = require("../../../models/TipModel");
const CouponCustomer = require("../../../models/Coupon/CouponCustomerModel");
const Payment = require("../../../models/Shopping/PaymentModel");
const Person = require("../../../models/Person/PersonModel");
const Customer = require("../../../models/CustomerModel");
const LogModel = require("../../../models/LogModel");

const CompanyModel = require("../../../models/Company/CompanyModel");
const OrderStatusModel = require("../../../models/Shopping/order/orderStatusModel");

/** Service */
const runProcessIntegration = require("../../../services/runProcessIntegration/runProcess");

const getAccount = require("../../../services/Finance/DigitalAccounts/getAccount");
const createAccount = require("../../../services/Finance/DigitalAccounts/createAccount");
const bankTransactions = require("../../../services/Finance/DigitalAccounts/BankTransactions");

const afterPayment = async (paymentCreate, respPayment, cart, delivery, valueTip, typeSchedule, req) => {
  try {
    logPayment(
      {
        payload: {
          paymentCreate,
          respPayment,
          cart,
          delivery,
          valueTip,
          typeSchedule,
        },
        message: "Função AfterPayment Iniciado",
      },
      "payment-after-braspag",
      "WARN",
    );

    if (paymentCreate && paymentCreate._id) {
      let companyDelivery = await CompayDelivery.findOne({
        company: paymentCreate.company,
      }).lean();

      let company = await CompanyModel.findOne({
        _id: paymentCreate.company,
      }).lean();

      let idCompanyDelivery = companyDelivery && companyDelivery._id ? companyDelivery._id : null;
      let order_number = Math.floor(1000 + Math.random() * 9000);

      logPayment(
        {
          payload: {
            payment: paymentCreate._id,
            company: paymentCreate.company,
            shoppingCart: paymentCreate.shoppingCart,
            customer: paymentCreate.customer,
            customerDelivery: delivery._id,
            companyDelivery: idCompanyDelivery,
            order_number: order_number,
            typePayment: paymentCreate.typePayment,
            typeSchedule: typeSchedule,
          },
          message: "Iniciar criação da Ordem",
        },
        "order-before-payment",
        "WARN",
      );

      const orderStatus = await OrderStatus.newOrder({
        payment: paymentCreate._id,
        company: paymentCreate.company,
        franchise: company.franchise,
        shoppingCart: paymentCreate.shoppingCart,
        customer: paymentCreate.customer,
        customerDelivery: delivery._id,
        companyDelivery: idCompanyDelivery,
        order_number: order_number,
        typePayment: paymentCreate.typePayment,
        typeSchedule: typeSchedule,
        shoppingPaymentMethod: paymentCreate.shoppingPaymentMethod,
      });

      logPayment(
        {
          payload: orderStatus,
          message: "Ordem Criada",
        },
        "order-after-payment",
        "WARN",
      );

      // processos de integração com o mercado
      // runProcessIntegration(paymentCreate.company, "newOrder", {
      //   orderId: orderStatus._id,
      // });

      await Payment.updateOne(
        { _id: paymentCreate._id },
        {
          order: orderStatus._id,
          franchise: company.franchise,
        },
      );

      await OrderTracking.newOrder({
        payment: paymentCreate._id,
        shoppingCart: cart._id,
        location: cart.company.location,
      });

      notification(paymentCreate);
      otherProcess(orderStatus, cart, valueTip);

      // customização registrar pagamento na conta digital
      const transactionCode = await registerTransactionInDigitalAccount(orderStatus, paymentCreate);
      await OrderStatusModel.findOneAndUpdate({ _id: orderStatus._id }, { transactionCode });

      return;
    }
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Payment/AfterPayment.js',
      error: err?.message,
      method: 'afterPayment',
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

    console.log("Erro afterPayment", err);
    logPayment(err, "method-afterPayment");
  }
};

const createCouponCustomer = async orderStatus => {
  const payment = await Payment.findById(orderStatus.payment);

  if (!payment.coupon) {
    return;
  }

  const customer = await Customer.findById(orderStatus.customer).lean();
  const person = await Person.findById(customer.person).lean();

  await CouponCustomer.create({
    coupon: payment.coupon,
    payment: payment._id,
    company: orderStatus.company,
    orderStatus: orderStatus._id,
    person: person._id,
    customer: orderStatus.customer,
  });
};

const notification = async paymentCreate => {
  try {
    let listShopper = await Shopper.find({
      company: paymentCreate.company,
    }).lean();
    listShopper.forEach(async itemShopper => {
      notificationApi.post(`/v1/app-notification/user/${itemShopper.person}`, {
        user: {
          auth: itemShopper.token,
          message: "Você tem um novo pedido!",
          params: {
            type: "NEW_ORDER",
          },
        },
      });
    });

    await database.ref().child(`${process.env.FIREBASE_PATH}newOrder/${paymentCreate.company}`).push({ message: "Novo pedido" });
  } catch (err) {
    logPayment(err, "payment-send-notification");
  }
};

const otherProcess = async (orderStatus, cart, valueTip) => {
  try {
    let tip;
    if (valueTip && valueTip > 0) {
      tip = await Tip.findOne({ value: valueTip }).lean();
      if (!tip) {
        tip = Tip.create({ status: true, value: valueTip, type: "user" });
      }
    }

    // Modificar Status do Carrinho
    let data = {};
    data.status = "inProgress";
    if (tip && tip._id) {
      data.tip = tip._id;
    }

    await Cart.findOneAndUpdate({ _id: cart._id }, data, {
      upsert: true,
      new: true,
    });

    createCouponCustomer(orderStatus);
  } catch (err) {
    return;
  }
};

//funcao responsavel por registrar as transação
const registerTransactionInDigitalAccount = async (order, payment) => {
  try {
    // obem a franquia para identificar a conta
    const { franchise } = await CompanyModel.findOne({ _id: order.company });

    ////////////// OBTEM AS CONTAS DE ORIGEM E O DESTINO //////////////
    const accountCompany = await getAccount(order.company, "Company", franchise, true);
    const accountCustomer = await getAccount(order.customer, "Person", franchise, true);
    const accountFranchise = await getAccount(franchise, "Franchise", franchise, true);

    ////////////// *** //////////////
    // cria a transação de crédio na conta do cliente (entrada do cartão de credito para a conta)
    const transaction = await bankTransactions({
      destinationAccount: accountCustomer._id,
      destinationAgency: accountCustomer.agency,
      value: payment.total,
      type: "credit",
      status: payment.status === "AWAITING_PAYMENT" ? "AWAITING" : "COMPLETED",
      payment: payment.id,
    });

    if (transaction) {
      ////////////// *** //////////////
      // cria a transação de debito da conta do cliente
      await bankTransactions({
        originAccount: accountCustomer._id,
        originAgency: accountCustomer.agency,
        destinationAccount: accountCompany._id,
        destinationAgency: accountCompany.agency,
        value: payment.total,
        type: "debit",
        status: payment.status === "AWAITING_PAYMENT" ? "AWAITING" : "COMPLETED",
        code: transaction.transactionCode,
        payment: payment.id,
      });

      ////////////// *** //////////////
      // cria a transação de credito na conta da empresa
      await bankTransactions({
        originAccount: accountCustomer._id,
        originAgency: accountCustomer.agency,
        destinationAccount: accountCompany._id,
        destinationAgency: accountCompany.agency,
        value: payment.total,
        type: "credit",
        status: payment.status === "AWAITING_PAYMENT" ? "AWAITING" : "COMPLETED",
        code: transaction.transactionCode,
        payment: payment.id,
      });

      ////////////// *** //////////////
      // cria a transação de débito na conta da empresa referente a taxa
      if (payment.debitPrice) {
        await bankTransactions({
          originAccount: accountCompany._id,
          originAgency: accountCompany.agency,
          destinationAccount: accountFranchise._id,
          destinationAgency: accountFranchise.agency,
          value: payment.debitPrice,
          type: "debit",
          status: payment.status === "AWAITING_PAYMENT" ? "AWAITING" : "COMPLETED",
          code: transaction.transactionCode,
          payment: payment.id,
        });

        ////////////// *** //////////////
        // cria a transação de credito na conta da franquia referete a taxa
        await bankTransactions({
          originAccount: accountCompany._id,
          originAgency: accountCompany.agency,
          destinationAccount: accountFranchise._id,
          destinationAgency: accountFranchise.agency,
          value: payment.debitPrice,
          type: "credit",
          status: payment.status === "AWAITING_PAYMENT" ? "AWAITING" : "COMPLETED",
          code: transaction.transactionCode,
          payment: payment.id,
        });
      } else {
        console.log("payment.debitPrice => ", payment.debitPrice);
      }
    }

    return transaction.transactionCode;
  } catch (error) {
    console.log("err registerTransactionInDigitalAccount", error);
  }
};

module.exports = afterPayment;
