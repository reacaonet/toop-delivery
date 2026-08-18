const moment = require("moment-timezone");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const LogModel = require("../../../models/LogModel");

/** Services */
const database = require("../../../services/firebase");
const { getDuratinAndDistance } = require("../../../services/maps/duratinAndDistance");
const apiPushNotification = require("../../../services/notification");
const feeService = require("../../../services/Payment/fee");

/** Util */
const { estimatedPrice } = require("../../../utils");
const PaymentModel = require("../../../models/Mobility/Payment/PaymentModel");

const changeRouteController = async (request, reply) => {
  try {
    const { booking, destiny, additionalStops = [] } = request.body;
    const timeZone = "America/Sao_Paulo";

    const currentBooking = await BookingModel.findById(booking)
      .select({
        _id: 1,
        passenger: 1,
        driver: 1,
        franchise: 1,
        payment: 1,
        service: 1,
        origin: 1,
        destiny: 1,
        additionalStops: 1,
        status: 1,
        historyChangeRoute: 1,
        price: 1,
        tagCost: 1,
        routeTime: 1,
        distance: 1,
      })
      .populate({
        path: "driver",
        select: {
          _id: 1,
          token: 1,
          location: 1,
        },
      })
      .populate({
        path: "payment",
        select: {
          _id: 1,
          typePayment: 1,
        },
      })
      .lean();

    if (!currentBooking) {
      return reply.status(400).send({
        message: "viagem não existe",
      });
    }

    if (currentBooking.status !== "accepted" && currentBooking.status !== "in_progress") {
      return reply.status(400).send({
        message: "Não é mais possível atualizar a rota, verifique o status da corrida",
      });
    }

    if (currentBooking?.historyChangeRoute && Array.isArray(currentBooking?.historyChangeRoute) && currentBooking?.historyChangeRoute.length >= 2) {
      return reply.status(400).send({
        message: "Limite para alterar a rota atingida, não é mais possível alterar a rota",
      });
    }

    if (currentBooking.payment?.typePayment !== "MONEY") {
      return reply.status(400).send({
        message: "No momento apenas pagamentos em dinheiro ou direto com o motorista são permitidos para este recurso",
      });
    }

    const filter = {
      _id: currentBooking.service,
    };

    const serviceCurrent = await ServiceModel.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          name: 1,
          franchise: 1,
          capacity: 1,
          priceCalculation: 1,
          minimumRate: 1,
          hourlyPrice: 1,
          basePrice: 1,
          valueByPercentage: 1,
          fixedValue: 1,
          baseDistance: 1,
          timePrice: 1,
          currencyPrice: 1,
          dispensingMinutes: 1,
          ratePerMinute: 1,
          status: 1,
          onlyForWomen: 1,
          images: 1,
          makers: 1,
          timeZone: 1,
          utc: 1,
          deletedAt: 1,
          distanceList: "$distance",
          peakHoursInfo: {
            $map: {
              input: "$peakHours",
              as: "hours",
              in: {
                $toObjectId: "$$hours._id",
              },
            },
          },
          peakHours: 1,
        },
      },
      {
        $lookup: {
          from: "peakHour",
          let: { peakHours: "$peakHoursInfo" },
          as: "peakHoursInfo",
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $cond: {
                        if: { $isArray: "$$peakHours" },
                        then: "$$peakHours",
                        else: [],
                      },
                    },
                  ],
                },
                status: true,
                deletedAt: {
                  $exists: false,
                },
              },
            },
            {
              $sort: {
                start: 1,
              },
            },
            {
              $project: {
                start: 1,
                end: 1,
              },
            },
          ],
        },
      },
      {
        $limit: 1,
      },
    ]);

    if (!serviceCurrent || !Array.isArray(serviceCurrent) || serviceCurrent.length <= 0) {
      return reply.status(400).send({
        message: "Serviço não encontrado",
      });
    }

    const service = serviceCurrent[0];

    const bookingOrigin = {
      latitude: currentBooking.origin.coordinates[1],
      longitude: currentBooking.origin.coordinates[0],
    };

    let stops = "";

    if (currentBooking && currentBooking?.driver && currentBooking?.driver?.location && currentBooking?.driver?.location?.coordinates) {
      stops = `${currentBooking?.driver?.location?.coordinates[1] || 0},${currentBooking?.driver?.location?.coordinates[0] || 0}|`;
    }

    if (additionalStops && Array.isArray(additionalStops) && additionalStops.length > 0) {
      additionalStops.map(item => {
        stops += `${item?.latitude || 0},${item?.longitude || 0}|`;
      });
    }

    const infoRace = await getDuratinAndDistance(bookingOrigin, destiny[destiny.length - 1], stops);

    if (!infoRace) {
      return reply.status(400).send({
        message: "Não foi possível calcular a rota",
      });
    }

    if (!infoRace.distance || infoRace.distance <= 0) {
      return reply.status(400).send({
        message: "No momento não é possível modificar a rota",
      });
    }

    let dataTime = moment().tz(timeZone);

    if (service.timeZone) {
      dataTime = moment().tz(service.timeZone);
    }

    const time = infoRace.duration;
    service.routeTime = "";

    if (time) {
      service.routeTime = `${parseInt(`${Number(time / 60)}`, 10)} min`;
    }

    if (infoRace.distance) {
      service.distance = `${Number(infoRace.distance / 1000).toFixed(2)} KM`;
    }

    if (infoRace.overviewPolyline) {
      service.overviewPolyline = infoRace.overviewPolyline;
    }

    if (infoRace.tagCost) {
      service.tagCost = infoRace.tagCost;
    }

    service.price = estimatedPrice(service, infoRace, dataTime);

    // ---------------------------------------------
    // Implementar metodo de nova cobrança e extorno
    // No momento só dinheiro
    // ---------------------------------------------

    const fee = await feeService(currentBooking.price, currentBooking?.franchise, currentBooking?.service); // calcula as taxas

    const paymentModel = await PaymentModel.create({
      passenger: currentBooking.passenger,
      total: service.price,
      typePayment: currentBooking?.payment?.typePayment,
      feeAdm: fee?.feeAdm,
      feeAdmValue: fee?.feeAdmValue,
      debitPriceAdm: fee?.debitPriceAdm,
      feeFranchise: fee?.feeFranchise,
      feeFranchiseValue: fee?.feeFranchiseValue,
      debitPriceFranchise: fee?.debitPriceFranchise,
    });

    if (!paymentModel || !paymentModel._id) {
      return reply.status(400).send({
        message: "Não foi possível prosseguir com o pagamento",
      });
    }

    // Atualizar Viagem
    let historyChangeRoute = [];

    if (currentBooking.historyChangeRoute && Array.isArray(currentBooking.historyChangeRoute)) {
      historyChangeRoute = currentBooking.historyChangeRoute;
    }

    const destinyUp = [];
    const additionalStopsUp = [];

    for (const item of destiny) {
      destinyUp.push({
        type: "Point",
        address: item.address ? item.address : "",
        coordinates: [Number(item.longitude), Number(item.latitude)],
      });
    }

    for (const item of additionalStops) {
      additionalStopsUp.push({
        type: "Point",
        address: item.address ? item.address : "",
        coordinates: [Number(item.longitude), Number(item.latitude)],
      });
    }

    historyChangeRoute.push({
      price: currentBooking.price,
      tagCost: currentBooking.tagCost || 0,
      payment: currentBooking.payment?._id,
      origin: currentBooking.origin,
      destiny: currentBooking.destiny,
      additionalStops: currentBooking.additionalStops,
      routeTime: currentBooking.routeTime,
      distance: currentBooking.distance,
    });

    const payloadBooking = {
      payment: paymentModel._id,
      price: service.price,
      routeTime: service.routeTime,
      distance: service.distance,
      destiny: destinyUp,
      additionalStops: additionalStopsUp,
      historyChangeRoute: historyChangeRoute,
    };

    if (service.tagCost && Number(`${service.tagCost}`) > 0) {
      payloadBooking.tagCost = service.tagCost;
    }

    await PaymentModel;
    await BookingModel.updateOne({ _id: booking }, payloadBooking);

    // MOTORISTA
    if (currentBooking.driver && currentBooking.driver.token) {
      const paramsNotify = {
        type: "change-route",
        booking: currentBooking._id.toString(),
        bookingId: currentBooking._id.toString(),
        title: "Rota Alterada",
        message: "O passageiro alterou a rota, confira a nova rota",
      };

      await realTimeNotifyDriver(currentBooking.driver._id.toString(), paramsNotify);

      await pushDriver(currentBooking, paramsNotify);
    }

    // PASSAGEIRO
    if (currentBooking.passenger) {
      realTimeNotifyUser(currentBooking.passenger, {
        type: "change-route",
        booking: booking._id.toString(),
        price: service.price,
        routeTime: service.routeTime,
        distance: service.distance,
      });
    }

    return reply.send({
      service: service,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/booking/ChangeRouteController.js',
      error: err?.message,
      method: 'changeRouteController',
      type: 'error',
      level: 0,
      origin: 'backend',
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

    console.log(`Log de erro criado com sucesso.`);

  console.log("err", err);

    return reply.status(400).send({
      message: "Não foi possível modificar a rota",
      err: err.message,
    });
  }
};

// notificar usuário de corrida Atualizada
const realTimeNotifyUser = async (passengerId, params = {}) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}passenger/${passengerId}`).set(params);
  } catch (err) {
    console.log("err realTimeNotifyUser", err);
  }
};

// notifica motorista corrida cancelada
const realTimeNotifyDriver = async (driverId, params = {}) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}driver/${driverId}`).set(params);
  } catch (err) {
    console.log("err realTimeNotifyUser", err);
  }
};

// push Driver
const pushDriver = async (currentBooking, paramsNotify) => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${currentBooking.driver.token}`, {
      user: {
        message: "O passageiro alterou a rota, confira a nova rota",
        auth: currentBooking.driver.token,
      },
      params: paramsNotify,
    });
  } catch (err) {

    console.log("fail push driver backend in changeRouteController: ", err.message);
  }
};

module.exports = changeRouteController;
