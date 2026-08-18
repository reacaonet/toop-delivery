/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable complexity */
const axios = require("axios");
const { Types } = require("mongoose");
const codeGenerator = require("voucher-code-generator");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const PaymentModel = require("../../../models/Mobility/Payment/PaymentModel");
const PassegerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const PersonModel = require("../../../models/Person/PersonModel");
const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const VoucherModel = require("../../../models/Mobility/Payment/VoucherModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");

/** Service */
const feeService = require("../../../services/Payment/feeMobility");
const { getVoucherPrice } = require("../../../services/Payment/voucher");

let gateway = process.env.GATEWAY_PAYMENT;

const createDeliverymanController = async (request, reply) => {
  try {
    const {
      origin,
      destiny,
      additionalStops = [],
      paymentMethod = "money",
      service,
      qrCode,
      distance,
      routeTime,
      driverId = null,
      tagCost = 0,
      voucher = null,
    } = request.body;
    const { lng } = request.query || {};

    const driver = await DriverModel.findById(driverId).lean();

    if (!driver || !driver._id) {
      return reply.status(400).send({
        message: translate("travel.driverNotFound", lng),
      });
    }

    let passengerId;

    const personExists = await PersonModel.findOne({
      name: "PASSAGEIRO EMBARQUE DIRETO",
    }).lean();

    if (!personExists) {
      const person = await PersonModel.create({
        name: "PASSAGEIRO EMBARQUE DIRETO",
      });

      const passeger = await PassegerModel.create({
        person: person._id,
      });

      passengerId = passeger._id;
    } else {
      const passeger = await PassegerModel.findOne({
        person: personExists._id,
      }).lean();

      passengerId = passeger?._id;
    }

    const { price } = request.body;

    if (paymentMethod === "money" && process.env?.PAYMENT_DISABLED_MONEY && `${process.env?.PAYMENT_DISABLED_MONEY}` === "true") {
      return reply.status(400).send({
        message: process.env.PAYMENT_DISABLED_MONEY_MSG,
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
        const respQrCode = await getQrCode(qrCode, request);

        if (!respQrCode || !respQrCode._id) {
          return reply.status(400).send({
            message: "Insira um código válido",
          });
        }

        raceToDriver = respQrCode.driver;
      }
    }

    const typePayment = getTypePayment(paymentMethod);

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
      _id: passengerId,
    })
      .populate("person")
      .lean();

    if (!passengerResp || !passengerResp.person) {
      return reply.status(400).send({
        message: "Verifique seu cadastro, informações ausentes",
      });
    }

    let myVoucher = null;

    if (voucher) {
      myVoucher = await getVoucher(price, voucher, request);
    }

    let priceToPaid = price;

    if (myVoucher?.total && myVoucher?.total > 0) {
      priceToPaid = priceToPaid - myVoucher?.total;
    }

    if ((typePayment === "PAGARME" || typePayment === "WALLET_PAGARME" || typePayment === "STRIPE" || typePayment === "WALLET_STRIPE") && priceToPaid < 1) {
      return reply.status(400).send({
        message: translate("booking.cardPayCanFron1", lng),
      });
    }

    let marker = null;
    const serviceCurrent = await ServiceModel.findOne({ _id: service })
      .select({
        makers: 1,
        requireConfirmationCode: 1,
      })
      .lean();

    if (serviceCurrent && serviceCurrent.makers && Array.isArray(serviceCurrent.makers) && serviceCurrent.makers.length > 0) {
      marker = serviceCurrent.makers[0];
    }

    request.body.passenger = passengerResp;
    const response = null;

    // calcula as taxas
    const fee = await feeService(price, passengerResp.franchise, service);

    //cria o pagamento inicial
    const paymentModel = await PaymentModel.create({
      passenger: passengerId,
      total: price,
      typePayment,
      feeAdm: fee && fee.feeAdm ? fee.feeAdm : 0,
      feeAdmValue: fee && fee.feeAdmValue ? fee.feeAdmValue : 0,
      debitPriceAdm: fee && fee.debitPriceAdm ? fee.debitPriceAdm : 0,
      feeFranchise: fee && fee.feeFranchise ? fee.feeFranchise : 0,
      feeFranchiseValue: fee && fee.feeFranchiseValue ? fee.feeFranchiseValue : 0,
      debitPriceFranchise: fee && fee.debitPriceFranchise ? fee.debitPriceFranchise : 0,
      voucher,
      priceDiscountVoucher: myVoucher?.total && myVoucher?.total > 0 ? myVoucher?.total : 0,
    });

    if (!paymentModel || !paymentModel._id) {
      return reply.status(400).send({
        message: "Não foi possível prosseguir com o pagamento",
      });
    }

    request.body.payment = paymentModel;
    const additional = {};

    const code = codeGenerator.generate({
      count: 1,
      length: 15,
    });

    const payloadBooking = {
      passenger: passengerId,
      payment: paymentModel._id,
      origin: originCreate,
      destiny: destinyCreate,
      additionalStops: additionalStopsCreate,
      service,
      price,
      // franchise: passengerResp.franchise,
      franchise: driver.franchise,
      raceToDriver,
      code: code[0],
      status: "accepted",
      driver: driverId,
      ...additional,
    };

    if (serviceCurrent.requireConfirmationCode) {
      payloadBooking.confirmationCode = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(
        Math.random() * 10,
      )}`;
    }

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

    const activeRun = driver.activeRun && Array.isArray(driver.activeRun) ? driver.activeRun : [];

    activeRun.push(bookingResponse?._id?.toString());

    const payloadDriver = {
      activeRun,
    };

    if (driver.activeRunStatus === "available") {
      payloadDriver.activeRunStatus = "race_accepted";
    }

    await DriverModel.updateOne({ _id: driverId }, payloadDriver);

    return reply.send({
      message: "Sucesso",
      booking: bookingResponse,
      ...additional,
    });
  } catch (err) {
    return reply.status(400).send({
      message: "Não foi possível solicitar viagem",
      err: err.message,
    });
  }
};

const getTypePayment = method => {
  if (method === "money") {
    return "MONEY";
  } else if (method === "credicard") {
    return gateway;
  } else if (method === "pix") {
    return "PIX";
  } else if (method === "card") {
    return "CARD";
  }

  return "MONEY";
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

module.exports = createDeliverymanController;
