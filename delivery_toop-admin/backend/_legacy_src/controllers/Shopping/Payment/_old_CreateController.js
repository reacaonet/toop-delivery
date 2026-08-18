const mongoose = require("mongoose");
const Cart = require("../../../models/Shopping/CartModel");
const DeliveryAddres = require("../../../models/Customer/DeliveryAddressModel");
const CustomerModel = require("../../../models/CustomerModel");
const PaymentMethod = require("../../../models/Shopping/PaymentMethodModel");
const CartItens = require("../../../models/Shopping/CartItemModel");
const CompayDelivery = require("../../../models/Company/CompanyDeliveryModel");
const Payment = require("../../../models/Shopping/PaymentModel");

const Cielo = require("../../../services/Payment/Cielo");
// const Braspag = require("../../../services/Payment/Braspag");
const SplitController = require("./SplitController");

const PayTotal = require("./PayTotalController");
const OrderStatus = require("../order/status/CreateController");
const OrderTracking = require("../order/tracking/CreateController");
const notificationApi = require("../../../services/notification");
const Shopper = require("../../../models/ShopperModel");
const LogModel = require("../../../models/LogModel");
const database = require("../../../services/firebase");

const paymentApi = require("../../../services/paymentApi");
const Tip = require("../../../models/TipModel");

const create = async (req, res) => {
  try {
    let fingerprint = "";
    let addDebug = {};

    try {
      const browserfingerprint = req.fingerPrinter;
      fingerprint = browserfingerprint.fingerprint(req).fingerprint;
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Payment/_old_CreateController.js',
        error: err?.message,
        method: 'create',
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
    }

    const msgValid = validCreatePost({ ...req.body, ...req.params });
    if (msgValid !== null) {
      logPayment({ message: msgValid }, "payment-not-valid");
      return res.status(400).send({ message: msgValid });
    }

    addDebug.params = req.params;
    addDebug.body = req.body;

    const { cartId } = req.params;
    const { customer, ipAddress, coupon, valueTip } = req.body;
    const cart = await Cart.findOne({
      _id: cartId,
      customer: customer,
    }).populate("company");

    if (!cart || !cart.status || cart.status !== "pending") {
      logPayment(addDebug, "Error-cart-payment-not-found");
      return res
        .status(400)
        .send({ message: "Carrinho não encontrado ou já finalizado..." });
    }

    addDebug.body = req.cart;
    const delivery = await DeliveryAddres.findOne({ customer, main: true });

    if (!delivery || !delivery.address) {
      addDebug.message =
        "Endereço de Entrega não cadastrado, por favor informe um endereço de entrega";
      logPayment(addDebug, "Error-delivery-payment");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    addDebug.body = req.delivery;
    const customerDB = await CustomerModel.findById(customer).populate(
      "person"
    );

    if (!customerDB || !customerDB._id) {
      (addDebug.message = "Cliente não encontrado"),
        logPayment(addDebug, "Error-customer-payment");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    // Preço Total
    const payTotal = await PayTotal.priceCart(
      cart._id,
      cart.company.type,
      true
    );
    let total = PayTotal.totalCart(payTotal);
    if (
      !payTotal ||
      payTotal === false ||
      !total ||
      total === false ||
      total < 1
    ) {
      addDebug.payTotal = payTotal;
      addDebug.total = total;
      addDebug.message =
        "Não foi possível concluir, por favor tente mais tarde ...";
      logPayment(addDebug, "Error-cart-payTotal");

      return res.status(400).send({
        message: addDebug.message,
      });
    }

    const cartItens = await CartItens.find({ shoppingCart: cart._id })
      .populate("product")
      .populate("FoodProduct");

    const paymentMethod = await PaymentMethod.findOne({
      customer,
      isMain: true,
    });

    const paymentType = "splittedcreditcard"; //Braspag  //'CreditCard' -> Cielo
    const capture = true;
    const provider = process.env.PROVIDER_PAYMENT_CIELO;
    const customerCielo = customerData(customerDB, delivery, paymentMethod);

    const paymentCielo = paymentData(
      paymentType,
      capture,
      provider,
      total,
      paymentMethod,
      fingerprint,
      ipAddress,
      cartItens
    );

    addDebug.paymentType = paymentType;
    addDebug.capture = capture;
    addDebug.provider = provider;
    addDebug.customerCielo = customerCielo;
    addDebug.paymentCielo = paymentCielo;

    if (customerCielo === false || paymentCielo === false) {
      addDebug.message =
        "Não foi possível concluir a compra por favor verifique as informações enviadas";
      logPayment(addDebug, "Error-cart-payment-not-found");
      return res.status(400).send({
        message: addDebug.message,
      });
    }

    // console.log('payTotal', payTotal);
    // console.log('total', total);

    // const splitData = await SplitController.split(
    //   cart.company._id,
    //   cart.company,
    //   payTotal.subTotal,
    //   paymentMethod,
    //   customerDB
    // ); // Split de pagamento - Calcular preço
    // addDebug.splitData = splitData;

    const splitData = null; // verificar porque falha ao usar o split

    if (splitData !== null && splitData !== false) {
      paymentCielo.splitpayments = splitData;
    }

    const payData = cieloData(cart._id, customerCielo, paymentCielo);
    let respPayment = null;

    // Realizar Pagamento
    try {
      const { data: response } = await paymentApi.post("/sales", payData);
      respPayment = response.data;
    } catch (err) {
      addDebug.payData =
        err.response && err.response.data ? err.response.data : null;
    }

    // const respPayment = await Braspag().sales().pay(payData);
    // addDebug.payData = payData;
    addDebug.respPayment = respPayment;

    if (!respPayment) {
      addDebug.message =
        "Não foi possível concluir a compra por favor verifique o método de pagamento selecionado";
      logPayment(addDebug, "payment-cielo-respPayment");
      return res.status(400).send({
        message: addDebug.message,
        payData,
        respPayment,
      });
    }

    if (!respPayment.Payment || !respPayment.Payment.Status) {
      addDebug.message =
        "Não foi possível concluir a compra por favor verifique o método de pagamento selecionado";
      logPayment(addDebug, "payment-cielo-error");
      return res.status(400).send({
        message: addDebug.message,
        payData,
        respPayment,
      });
    }

    let statusMessage = Cielo.sales.statusPay(respPayment.Payment.Status);

    // Descomentar quando tiver solucionado
    // if (respPayment.Payment.Status  !== 1 || respPayment.Payment.Status !== 2) {
    //   return res.send({
    //     provider,
    //     status: respPayment.Payment.Status,
    //     paymentId: Math.random(), //para manter o padrão app antingos
    //     statusMessage,
    //   });
    // }

    // Implementado para testar o fluxo enquanto soluciona a Braspag
    let statusTemp = 2;
    statusMessage = "Pagamento Aprovado";

    const tip = await getTip(valueTip);

    const paymentCreate = await Payment.create({
      customer,
      shoppingCart: cart._id,
      company: cart.company._id,
      coupon,
      total: total,
      totalCompany: payTotal.subTotal,
      priceDelivery: payTotal.deliveryFee,
      serviceCharge: payTotal.serviceCharge,
      deliveryAddress: delivery._id,
      provider,
      paymentProviderId: respPayment.Payment.PaymentId,
      payload: respPayment,
      // statusPayload: respPayment.Payment.Status,
      statusPayload: statusTemp,
      tip: [tip._id, tip.value],
    });

    afterPayment(paymentCreate, respPayment, cart, delivery, tip);

    return res.send({
      provider,
      // status: respPayment.Payment.Status,
      status: statusTemp,
      paymentId: paymentCreate._id,
      statusMessage,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Payment/_old_CreateController.js',
      error: err?.message,
      method: 'create',
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

    console.log("Err", err);
    logPayment(err, "Error-All-Payment");
    return res.status(400).send({
      message: "Falha ao concluir pagamento",
      Error: err,
    });
  }
};

const getTip = async (valueTip) => {
  let tip;

  if (valueTip && valueTip > 0) {
    tip = await Tip.findOne({ value: valueTip });

    if (!tip) {
      tip = await Tip.create({
        status: true,
        value: valueTip,
        type: "user",
      });
    }

    return tip;
  } else {
    return null;
  }
};

const validCreatePost = (data) => {
  try {
    if (!data.cartId || !mongoose.Types.ObjectId.isValid(data.cartId)) {
      return "Carrinho inválido";
    }

    if (!data.customer || !mongoose.Types.ObjectId.isValid(data.customer)) {
      return "Id do cliente inválido";
    }

    return null;
  } catch (err) {
    return "Verifique as informações enviadas e tente novamente";
  }
};

const cieloData = (orderId, customer, payment) => {
  return {
    MerchantOrderId: orderId,
    Customer: customer,
    Payment: payment,
  };
};

const customerData = (customer, delivery, paymentMethod) => {
  try {
    let name = customer.person.name;
    let accept = `${process.env.PROVIDER_PAYMENT_CIELO}`;
    accept = accept.trim();

    if (`${accept}` == "Simulado") {
      name += " Accept";
    }

    return {
      Name: name,
      Email: customer.email,
      Identity: paymentMethod.document,
      IdentityType: paymentMethod.documentType,
      //Birthdate: '1991-01-10',
      Phone: customer.phone,
      // Address: {
      //   Street: delivery.address.slice(0, 53),
      //   Number: 5,
      //   State: "GO",
      //   City: "Goiânia",
      //   Country: "BR",
      //   District: "Setor Bueno",
      // },
      // DeliveryAddress: {
      //   Street: delivery.address.slice(0, 53),
      //   Number: 5,
      //   State: "GO",
      //   City: "Goiânia",
      //   Country: "BR",
      //   District: "Setor Bueno",
      // },
    };
  } catch (err) {
    logPayment(err, "method-customerData");
    return false;
  }
};

const paymentData = (
  paymentType,
  capture,
  provider,
  payTotal,
  paymentMethod,
  fingerprint,
  ipAddress,
  cartItens
) => {
  /**
   * Teste
   *  SandBox cardToken
      - Autorizado 6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeA
      - Negado 6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeB
   */

  /**
   * https://braspag.github.io//manual/antifraude#tabela-31-merchantdefineddata-(cybersource)
   */

  try {
    let total = payTotal.toFixed(2) * 100;
    return {
      // Nem ideia onde vem essas credencias
      // Credentials: {
      //   Code: '',
      //   Key: '',
      // },
      Type: paymentType,
      Amount: total,
      Capture: capture,
      Currency: "BRL",
      Country: "BRA",
      Provider: provider,
      ServiceTaxAmount: 0,
      Installments: 1,
      Authenticate: false,
      SoftDescriptor: "EconomizeBR",
      CreditCard: {
        CardToken: paymentMethod.cardToken,
        // CardToken: "6fb7a669aca457a9e43009b3d66baef8bdefb49aa85434a5adb906d3f920bfeA",
        Brand: flagCard(paymentMethod.flag),
      },
      FraudAnalysis: {
        // Sequence: "AnalyseFirst",
        SequenceCriteria: "OnSuccess",
        Provider: process.env.PROVIDER_CIELO_FRAUDANALYSIS,
        TotalOrderAmount: total,
        FingerPrintId: fingerprint,
        Browser: {
          IpAddress: ipAddress,
          BrowserFingerPrint: fingerprint,
          CookiesAccepted: false,
        },
        Cart: {
          Items: getItems(cartItens),
        },
        MerchantDefinedFields: [
          {
            Id: 4,
            Value: "Web",
          },
          /* cupom desconto
          {
            Id: 5,
            Value: 'Web',
          }
          */
        ],
      },
    };
  } catch (err) {
    logPayment(err, "method-paymentData");
    return false;
  }
};

const getItems = (cartItens) => {
  try {
    return cartItens.map((cart) => {
      let productName = "";
      let price = "";

      if (cart.product) {
        productName = cart.product.name;
      } else if (cart.foodProduct) {
        productName = cart.foodProduct.name;
      }

      if (cart.pricePromotion) {
        price = cart.pricePromotion;
      } else {
        price = cart.price;
      }

      return {
        Name: productName,
        Quantity: cart.amount,
        Sku: cart._id,
        UnitPrice: price,
      };
    });
  } catch (err) {
    return [];
  }
};

const afterPayment = async (
  paymentCreate,
  respPayment,
  cart,
  delivery,
  tip
) => {
  try {
    if (
      paymentCreate &&
      paymentCreate._id &&
      respPayment.Payment.Status >= 0
      // -> Comentado temporariamente
      // &&
      // respPayment.Payment.Status <= 2
    ) {
      let companyDelivery = await CompayDelivery.findOne({
        company: paymentCreate.company,
      }).lean();
      let idCompanyDelivery =
        companyDelivery && companyDelivery._id ? companyDelivery._id : null;
      let order_number = Math.floor(1000 + Math.random() * 9000);

      await OrderStatus.newOrder({
        payment: paymentCreate._id,
        company: paymentCreate.company,
        shoppingCart: paymentCreate.shoppingCart,
        customer: paymentCreate.customer,
        customerDelivery: delivery._id,
        companyDelivery: idCompanyDelivery,
        order_number: order_number,
      });

      await OrderTracking.newOrder({
        payment: paymentCreate._id,
        shoppingCart: cart._id,
        location: cart.company.location,
      });

      // Shopper
      // paymentCreate.company
      let listShopper = await Shopper.find({ company: paymentCreate.company });

      try {
        listShopper.forEach(async (itemShopper) => {
          notificationApi.post(
            `/v1/app-notification/user/${itemShopper.device}`,
            {
              user: {
                auth: itemShopper.token,
                message: "Você tem um novo pedido!",
              },
            }
          );
          await database
            .ref()
            .child(`newOrder/${itemShopper.company}`)
            .push({ message: "Novo pedido" });
        });
      } catch (err) {
        logPayment(err, "payment-send-notification");
      }

      // Modificar Status do Carrinho
      // const data = { status: "inProgress", tip: tip._id };
      let data = {};
      data.status = "inProgress";
      if (tip && tip._id) {
        data.tip = tip._id;
      }

      await Cart.findOneAndUpdate(
        {
          _id: cart._id,
        },
        data,
        {
          upsert: true,
          new: true,
        }
      );
    }
  } catch (err) {
    console.log("Erro cart", err);
    logPayment(err, "method-afterPayment");
    return;
  }
};

const logPayment = (err, originError) => {
  try {
    Log.create({
      typeSystem: "BACKEND",
      typeLog: "ERROR",
      description: err,
      category: "payment",
      originError: originError,
    });
  } catch (err) {
    console.log("Opps fail create log", err);
  }
};

const flagCard = (flag) => {
  try {
    if (flag === "MASTERCARD") {
      return "MASTER";
    }

    return flag;
  } catch (err) {
    return flag;
  }
};

module.exports = create;
