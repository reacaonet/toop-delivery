const notificationApi = require("../../../services/notification");
const logPayment = require("./util/logPayment");
const Tip = require("../../../models/TipModel");
const Cart = require("../../../models/Shopping/CartModel");
const Payment = require("../../../models/Shopping/PaymentModel");
const Person = require("../../../models/Person/PersonModel");
const Customer = require("../../../models/CustomerModel");
const Shopper = require("../../../models/ShopperModel");
const CompanyDelivery = require("../../../models/Company/CompanyDeliveryModel");
const CouponCustomer = require("../../../models/Coupon/CouponCustomerModel");

const CompanyModel = require("../../../models/Company/CompanyModel");
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const orderStatusModel = require("../../../models/Shopping/order/orderStatusModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const database = require("../../../services/firebase");
const runProcessIntegration = require("../../../services/runProcessIntegration/runProcess");

const getAccount = require("./../../../services/Finance/DigitalAccounts/getAccount");
const createAccount = require("./../../../services/Finance/DigitalAccounts/createAccount");
const bankTransactions = require("./../../../services/Finance/DigitalAccounts/BankTransactions");

const afterPayment = async (payment, orderStatus, cart, valueTip, cartTotal) => {
  try {
    payment = await debitPriceCompany(payment._id, cart, cartTotal);
    await notification(payment);
    otherProcess(orderStatus, payment, cart, valueTip);

    // customização registrar pagamento na conta digital
    const transactionCode = await registerTransactionInDigitalAccount(orderStatus, payment);

    let company = await CompanyModel.findOne({ _id: payment.company }).lean();
    await Payment.updateOne({ _id: payment._id }, { franchise: company.franchise });
    await orderStatusModel.findOneAndUpdate({ _id: orderStatus._id }, { transactionCode, franchise: company.franchise });

    // processos de integração com o mercado
    runProcessIntegration(payment.company, "newOrder", {
      orderId: orderStatus._id,
    });

    return;
  } catch (err) {
    logPayment(err, "method-afterPayment");
  }
};

const notification = async payment => {
  try {
    let listShopper = await Shopper.find({ company: payment.company }).lean();

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

    await database.ref().child(`${process.env.FIREBASE_PATH}newOrder/${payment.company}`).push({ message: "Novo pedido" });
  } catch (err) {
    console.log("Fail Send Notification", err);
    logPayment(err, "payment-send-notification");
  }
};

const otherProcess = async (orderStatus, payment, cart, valueTip) => {
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

    await createCouponCustomer(orderStatus, payment);
  } catch (err) {
    console.log("otherProcess Err", otherProcess);
  }
};

const createCouponCustomer = async (orderStatus, paymentCreate) => {
  try {
    const payment = await Payment.findById(paymentCreate._id);

    if (payment && payment.coupon) {
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
    }
  } catch (err) {
    logPayment(err, "fail-createCouponCustomer");
  }
};

const debitPriceCompany = async (paymentId, cart, cartTotal) => {
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
    return await Payment.findOne({ _id: paymentId });
  } catch (err) {
    return 0;
  }
};

//funcao responsavel por registrar as transação
const registerTransactionInDigitalAccount = async (order, payment) => {
  try {
    console.log(payment);
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
      payment: payment._id,
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
        payment: payment._id,
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
        payment: payment._id,
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
          payment: payment._id,
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
          payment: payment._id,
        });
      } else {
        console.log("payment.debitPrice => ", payment.debitPrice);
      }
    }

    return transaction.transactionCode;
  } catch (error) {
    console.log(error);
  }
};

module.exports = afterPayment;
