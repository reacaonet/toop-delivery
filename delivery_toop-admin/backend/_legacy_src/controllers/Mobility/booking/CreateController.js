const { Types } = require("mongoose");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const PaymentModel = require("../../../models/Mobility/Payment/PaymentModel");
const PaymentMethodModel = require("../../../models/Shopping/PaymentMethodModel");
const PassegerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const VoucherModel = require("../../../models/Mobility/Payment/VoucherModel");
const TravelBookingInfoModel = require("../../../models/Mobility/Booking/TravelBookingInfoModel");
const LogModel = require("../../../models/LogModel");
const { notifyMonitoring } = require("../../../services/monitoring/notifyMonitoring");

/** Service */
const paymentCredit = require("../../../services/Payment/pagarMe/paymentCredit");
const feeService = require("../../../services/Payment/feeMobility");
const { getVoucherPrice } = require("../../../services/Payment/voucher");
const walletBalance = require("../../../services/Finance/DigitalAccounts/balance");

const { iugu } = require("./payment/iugu");

const createController = async (request, reply) => {
  try {
    const {
      passenger,
      origin,
      destiny,
      additionalStops = [],
      paymentMethod = "money",
      service,
      qrCode,
      distance,
      routeTime,
      driver = null,
      tagCost = 0,
      useWalletBalance,
      voucher = null,
    } = request.body;

    let { price = 0 } = request.body;

    // Verificar se existe alguma corrida ativa
    const bookingActive = await BookingModel.findOne({
      passenger: passenger,
      status: {
        $in: ["waiting", "accepted", "in_progress"],
      },
    }).lean();

    if (bookingActive && bookingActive._id) {
      return reply.status(400).send({
        message: "Já existe uma solicitação em andamento",
      });
    }

    if (price > Number(`${process.env.PRICE_MAX}`)) {
      return reply.status(400).send({
        message: "Sua corrida excede o valor máximo permitido pelo aplicativo. Escolha trajetos mais próximos ou acione o suporte.",
      });
    }

    if (paymentMethod === "credicard" && price < 1) {
      return reply.status(400).send({
        message: "Pagamentos com cartão de crédito só podem ser pagos a partir de 1,00",
      });
    }

    let raceToDriver = null;

    if (qrCode) {
      if (driver && Types.ObjectId.isValid(driver)) {
        raceToDriver = driver;
      } else {
        const respQrCode = await getQrCode(qrCode);

        if (!respQrCode || !respQrCode._id) {
          return reply.status(400).send({
            message: "Informe um código válido",
          });
        }

        raceToDriver = respQrCode.driver;
      }
    }

    let typePayment = getTypePayment(paymentMethod);

    const originCreate = {
      address: origin.address ? origin.address : "",
      type: "Point",
      coordinates: [Number(origin.longitude), Number(origin.latitude)],
    };

    const destinyCreate = [];
    const additionalStopsCreate = [];

    for (const item of destiny) {
      destinyCreate.push({
        type: "Point",
        address: item.address ? item.address : "",
        coordinates: [Number(item.longitude), Number(item.latitude)],
      });
    }

    // additionalStops
    for (const item of additionalStops) {
      additionalStopsCreate.push({
        type: "Point",
        address: item.address ? item.address : "",
        coordinates: [Number(item.longitude), Number(item.latitude)],
      });
    }

    const passengerResp = await PassegerModel.findOne({
      _id: passenger,
    })
      .populate("person")
      .lean();

    if (!passengerResp || !passengerResp.person) {
      return reply.status(400).send({
        message: "Verifique seu cadastro, informações ausentes",
      });
    }

    let myVoucher = null;

    if (voucher && Types.ObjectId.isValid(voucher)) {
      myVoucher = await getVoucher(price, voucher);
    }

    let priceToPaid = price;

    if (myVoucher?.total && myVoucher?.total > 0) {
      priceToPaid = priceToPaid - myVoucher?.total;
      price = price - myVoucher?.total;
    }

    /** CASO O CLIENTE ESCOLHA PAGAR COM O SALDO DA CARTEIRA DIGITAL, ENTÃO VERIFICA O SALDO QUE ELE TEM */
    let valueWalletBalance = 0;

    if (useWalletBalance) {
      const balanceCustomer = await walletBalance.getCustomerPassengerBalance("", passengerResp._id);

      if (balanceCustomer.balance >= priceToPaid) {
        valueWalletBalance = priceToPaid;
        typePayment = "WALLET";
      } else {
        valueWalletBalance = balanceCustomer.balance;

        if (typePayment === "PAGARME") {
          typePayment = "WALLET_PAGARME";
        }

        if (typePayment === "CARD") typePayment = "WALLET_CARD";

        if (typePayment === "MONEY") typePayment = "WALLET_MONEY";

        if (typePayment === "PIX") typePayment = "WALLET_PIX";

        if (typePayment === "IUGU") typePayment = "IUGU";
      }
    }

    priceToPaid = priceToPaid - valueWalletBalance;

    if ((typePayment === "PAGARME" || typePayment === "WALLET_PAGARME") && priceToPaid < 1) {
      return reply.status(400).send({
        message: "Pagamentos com cartão de crédito só podem ser pagos a partir de R$ 1,00",
      });
    }

    let marker = null;
    const serviceCurrent = await ServiceModel.findOne({ _id: service })
      .select({
        makers: 1,
      })
      .populate({
        path: "franchise",
        select: {
          coin: 1,
          languageDefault: 1,
        },
      })
      .lean();

    if (serviceCurrent && serviceCurrent.makers && Array.isArray(serviceCurrent.makers) && serviceCurrent.makers.length > 0) {
      marker = serviceCurrent.makers[0];
    }

    request.body.passenger = passengerResp;
    let response = null;

    // calcula as taxas
    const fee = await feeService(price, serviceCurrent?.franchise?._id, service);

    const paymentModel = await PaymentModel.create({
      passenger,
      total: price,
      useWalletBalance,
      typePayment,
      valueWalletBalance,
      feeAdm: fee && fee.feeAdm ? fee.feeAdm : 0,
      feeAdmValue: fee && fee.feeAdmValue ? fee.feeAdmValue : 0,
      debitPriceAdm: fee && fee.debitPriceAdm ? fee.debitPriceAdm : 0,
      feeFranchise: fee && fee.feeFranchise ? fee.feeFranchise : 0,
      feeFranchiseValue: fee && fee.feeFranchiseValue ? fee.feeFranchiseValue : 0,
      debitPriceFranchise: fee && fee.debitPriceFranchise ? fee.debitPriceFranchise : 0,
      voucher,
      priceDiscountVoucher: myVoucher?.total && myVoucher?.total > 0 ? myVoucher?.total : 0,
      currencySymbol: serviceCurrent?.franchise?.coin || "R$",
    });

    if (!paymentModel || !paymentModel._id) {
      return reply.status(400).send({
        message: "Não foi possível prosseguir com o pagamento",
      });
    }

    request.body.payment = paymentModel;
    request.body.typePayment = typePayment;
    let payloadUpPayment = null;
    const additional = {};

    if (typePayment === "PAGARME" || typePayment === "WALLET_PAGARME") {
      request.body.price = priceToPaid - valueWalletBalance;
      response = await creditCard(request.body);

      if (!response) {
        return reply.status(400).send({
          message: "Não conseguimos efetuar a cobrança",
        });
      }

      if (response && response.errMessage) {
        return reply.status(400).send({
          message: response.errMessage,
        });
      }

      payloadUpPayment = {
        provider: "PAGARME",
        paymentProviderId: response.id,
        payload: response,
        statusPayload: response.status,
        capture: true,
      };
    }

    if (typePayment === "IUGU") {
      response = await iugu(request.body);

      if (!response) {
        return reply.status(400).send({
          message: "Não conseguimos efetuar a cobrança",
        });
      }

      if (response && response.errMessage) {
        return reply.status(400).send({
          message: response.errMessage,
        });
      }
    }

    if (payloadUpPayment) {
      await PaymentModel.updateOne({ _id: paymentModel._id }, payloadUpPayment); // atualiza o pagamento
    }

    if (typePayment === "PAGARME" && (!response.status || response.status !== "paid")) {
      return reply.status(400).send({
        message: response.statusMessage ? response.statusMessage : "Não foi possível aprovar pagamento",
      });
    }

    const payloadBooking = {
      passenger,
      payment: paymentModel._id,
      origin: originCreate,
      destiny: destinyCreate,
      additionalStops: additionalStopsCreate,
      service,
      price,
      priceToPaid,
      franchise: serviceCurrent?.franchise?._id,
      raceToDriver,
      status: typePayment === "PIX" && priceToPaid > 0 ? "waiting_pix" : "waiting",
      ...additional,
    };

    if (distance) {
      payloadBooking.distance = distance;
    }

    if (routeTime) {
      payloadBooking.routeTime = routeTime;
    }

    if (marker) {
      payloadBooking.marker = marker;
    }

    if (tagCost && Number(`${tagCost}`) > 0) {
      payloadBooking.tagCost = tagCost;
    }

    const bookingResponse = await BookingModel.create(payloadBooking);

    // Travel Booking Info
    await setTravelBooking(passenger, bookingResponse?._id);

    notifyMonitoring(bookingResponse?._id, bookingResponse?.franchise, bookingResponse?.status || "waiting", request);

    return reply.send({
      message: "Aguarde encontrando motorista",
      booking: bookingResponse,
      ...additional,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/CreateController.js",
      error: err?.message,
      method: "createController",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        company: request?.company,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    return reply.status(400).send({
      message: "Não foi possível solicitar corrida",
      err: err.message,
    });
  }
};

const getTypePayment = method => {
  if (method === "money") {
    return "MONEY";
  } else if (method === "credicard") {
    return "IUGU";
  } else if (method === "pix") {
    return "PIX";
  } else if (method === "card") {
    return "CARD";
  }

  return "MONEY";
};

const creditCard = async body => {
  try {
    const respMethod = await PaymentMethodModel.findOne({
      // passenger: body.passenger._id.toString(),
      customer: body.customer,
      isMain: true,
      isDeleted: false,
    });

    if (!respMethod || !respMethod._id) {
      throw new Error("Método de pagamento não cadastrado, por favor cadastre um cartão de crédito");
    }

    body.paymentMethod = respMethod;
    body.passenger = body.passenger.person;

    const response = await paymentCredit(body);

    return response;
  } catch (err) {
    return {
      errMessage: err.message,
    };
  }
};

const getQrCode = async code => {
  try {
    const { data: response } = await axios.get(`http://${process.env.IP}:${process.env.PORT}/v1/mobility/qrcode/list-driver-code?code=${code}`);

    return response;
  } catch (err) {
    return null;
  }
};

const getVoucher = async (price, idVoucher) => {
  try {
    const respVoucher = await VoucherModel.findById(idVoucher).lean();

    if (!respVoucher) {
      throw new Error("O Voucher de Desconto Informado não existe");
    }

    if (respVoucher.active !== true) {
      throw new Error("O Voucher de Desconto não está mais ativo");
    }

    const resp = getVoucherPrice(price, respVoucher);

    return resp;
  } catch (err) {
    throw new Error("sentimos muito, não foi possível utilizar o voucher de desconto");
  }
};

const setTravelBooking = async (passengerId, bookingId) => {
  try {
    const respTravel = await TravelBookingInfoModel.findOne({
      passenger: passengerId,
      status: "search",
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!respTravel || !respTravel?._id) {
      return;
    }

    await TravelBookingInfoModel.updateOne(
      { _id: respTravel._id },
      {
        status: "travelRequest",
        booking: bookingId,
      },
    );
  } catch (err) {
    return;
  }
};

module.exports = createController;
