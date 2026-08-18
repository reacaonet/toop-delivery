const { Types } = require("mongoose");
/** Model */
const BookingModel = require("../../../../models/Mobility/Booking/BookingModel");
const DriverModel = require("../../../../models/Mobility/Driver/DriverModel");
const PassegerModel = require("../../../../models/Mobility/Passenger/PassengerModel");
const PersonModel = require("../../../../models/Person/PersonModel");
const PaymentModel = require("../../../../models/Mobility/Payment/PaymentModel");
const ServiceModel = require("../../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../../models/LogModel");
/** Service */
const apiPushNotification = require("../../../../services/notification");
const { notifyMonitoring } = require("../../../../services/monitoring/notifyMonitoring");
const feeService = require("../../../../services/Payment/fee");

const createScheduleController = async (request, reply) => {
  try {
    const {
      origin,
      destiny,
      additionalStops = [],
      service,
      distance,
      routeTime,
      driverId = null,
      company,
      startRaceAt,
      externalConsultant,
      internalConsultant,
      passenger,
      createPassenger,
      client: clientId = null,
      price,
    } = request.body;

    const driver = await DriverModel.findById(driverId).lean();

    if (!driver || !driver._id) {
      return reply.code(400).send({
        message: "Motorista não encontrado",
      });
    }

    if (driver?.block === true) {
      return reply.code(400).send({
        message: "motorista está bloqueado, entre em contato com o suporte para mais detalhes",
      });
    }

    if (driver?.deletedAt) {
      return reply.code(400).send({
        message: "Motorista não está mais ativo, por favor entre em contato com o suporte",
      });
    }

    let passengerId = null;
    let franchise = driver.franchise;

    if (passenger && Types.ObjectId.isValid(passenger)) {
      const passeger = await PassegerModel.findOne({
        _id: passenger,
      }).lean();

      passengerId = passeger?._id;
    } else if (createPassenger) {
      const person = await PersonModel.create({
        name: passenger,
        franchise: franchise,
      });

      const passeger = await PassegerModel.create({
        person: person._id,
        franchise: franchise,
      });

      passengerId = passeger._id;
    } else {
      return reply.code(400).send({
        message: "Informe um passageiro válido",
      });
    }

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
    const fee = await feeService(price, franchise, service);

    //cria o pagamento inicial
    const paymentModel = await PaymentModel.create({
      passenger: passengerId,
      total: price,
      estimatedTotal: price,
      typePayment: "MONEY",
      feeAdm: fee && fee.feeAdm ? fee.feeAdm : 0,
      feeAdmValue: fee && fee.feeAdmValue ? fee.feeAdmValue : 0,
      debitPriceAdm: fee && fee.debitPriceAdm ? fee.debitPriceAdm : 0,
      feeFranchise: fee && fee.feeFranchise ? fee.feeFranchise : 0,
      feeFranchiseValue: fee && fee.feeFranchiseValue ? fee.feeFranchiseValue : 0,
      debitPriceFranchise: fee && fee.debitPriceFranchise ? fee.debitPriceFranchise : 0,
    });

    if (!paymentModel || !paymentModel._id) {
      return reply.status(400).send({
        message: "Não foi possível prosseguir com o pagamento",
      });
    }

    request.body.payment = paymentModel;
    request.body.typePayment = "MONEY";
    let payloadUpPayment = null;
    const additional = {};

    const payloadBooking = {
      passenger,
      payment: paymentModel._id,
      origin: originCreate,
      destiny: destinyCreate,
      additionalStops: additionalStopsCreate,
      service: service,
      price: price,
      estimatedPrice: price,
      franchise: driver.franchise,
      raceToDriver: driver._id,
      status: "scheduled",
      driver: driverId,
      client: clientId,
      ...additional,
    };

    if (distance) {
      payloadBooking.distance = distance;
    }

    if (routeTime) {
      payloadBooking.routeTime = routeTime;
    }

    if (externalConsultant) {
      payloadBooking.externalConsultant = externalConsultant;
    }

    if (internalConsultant) {
      payloadBooking.internalConsultant = internalConsultant;
    }

    if (startRaceAt) {
      payloadBooking.startRaceAt = new Date(startRaceAt);
    }

    if (company && Types.ObjectId.isValid(company)) {
      payloadBooking.company = company;
    }

    const bookingResponse = await BookingModel.create(payloadBooking);

    if (driver.token) {
      sendPushNotification(driver.token);
    }

    if (bookingResponse?._id && bookingResponse?.franchise) {
      notifyMonitoring(bookingResponse._id, bookingResponse.franchise, "scheduled", request);
    }

    return reply.send({
      message: "Sucesso",
      booking: bookingResponse,
      ...additional,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/v1/mobility/booking/CreateScheduleController.ts",
      error: err?.message,
      method: "createScheduleController",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
        appversion: request?.headers?.appversion,
      },
    });

    return reply.status(400).send({
      err: err.message,
      message: "não foi possível criar agendamento",
    });
  }
};

const sendPushNotification = async token => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: "você tem um novo agendamento, venha conferir",
        auth: token,
      },
      params: {
        title: "Novo agendamento",
        message: "você tem um novo agendamento, venha conferir",
      },
    });
  } catch (err) {
    return;
  }
};

module.exports = createScheduleController;
