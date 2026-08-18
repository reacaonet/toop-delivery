const moment = require("moment");
const mongoose = require("mongoose");
/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const PaymentModel = require("../../../models/Mobility/Payment/PaymentModel");
const TravelBookingInfoModel = require("../../../models/Mobility/Booking/TravelBookingInfoModel");
const DriverLocationModel = require("../../../models/Mobility/Driver/DriverLocationModel");
const LogModel = require("../../../models/LogModel");
const { notifyMonitoring } = require("../../../services/monitoring/notifyMonitoring");

/** Service */
const database = require("../../../services/firebase");
const apiPushNotification = require("../../../services/notification");
const feeService = require("../../../services/Payment/feeMobility");
const routeCompleted = require("../../../services/maps/routeCompleted");
const { getServices } = require("../Service/AvailableController");

const { round, estimatedPrice, dynamicPrice } = require("../../../utils");

/**
 * finishAdmin - viagem finalizada pelo painel admin
 */
const complete = async (request, reply) => {
  try {
    const { driverId, bookingId, finishAdmin, tripDistance = 0 } = request.body;
    let filter = {};

    filter = {
      _id: bookingId,
      driver: driverId,
      status: finishAdmin && `${finishAdmin}` === "true" ? { $in: ["accepted", "in_progress"] } : "in_progress",
    };

    const booking = await BookingModel.findOne(filter)
      .populate({
        path: "passenger",
        select: {
          _id: 1,
          token: 1,
        },
        populate: {
          path: "person",
          select: {
            name: 1,
          },
        },
      })
      .populate("payment", {
        _id: 1,
        total: 1,
        debitPriceAdm: 1,
        debitPriceFranchise: 1,
        typePayment: 1,
        voucher: 1,
        priceDiscountVoucher: 1,
        valueWalletBalance: 1,
      })
      .populate({
        path: "franchise",
        select: {
          _id: 1,
          settingsRace: 1,
        },
      })
      .lean();

    if (!booking) {
      return reply.status(400).send({
        message: "Solicitação não encontrada ou não disponível",
      });
    }

    const historicAction = booking?.historicAction || {};
    historicAction.finishedRace = {
      date: moment().utc(false).toDate(),
    };

    const upBooking = {
      status: "concluded",
      historicAction: historicAction,
    };

    if (tripDistance > 0) {
      upBooking.tripDistance = Number(Number(tripDistance).toFixed(4));
    }

    if (!finishAdmin || `${finishAdmin}` !== "true") {
      const respRouteComplete = await setRouteComplete(booking, driverId, tripDistance || 0, request);

      if (
        respRouteComplete &&
        respRouteComplete?.isToRecalculate === true &&
        respRouteComplete?.travelledPrice &&
        respRouteComplete?.travelledPrice > 0 &&
        booking?.payment?.typePayment === "MONEY"
      ) {
        const newPrice = Number(Number(`${respRouteComplete?.travelledPrice}`).toFixed(2));

        booking.price = newPrice;
        upBooking.price = newPrice;
        upBooking.priceChanged = true;
        booking.priceChanged = true;
        booking.payment.total = newPrice;
        // payloadPayment.total = newPrice;
        // payloadPayment.priceChanged = true;
      }
    }

    if (booking.driver) {
      releaseDriver(booking.driver);
    }

    realTimeNotifyUser(booking.passenger._id, {
      type: "race_concluded",
      booking: booking._id.toString(),
    });

    realTimeNotifyDriver(booking);

    if (booking.passenger && booking.passenger.token) {
      sendPushNotification(booking.passenger.token);
    }

    serviceCharge(booking);

    notifyMonitoring(booking?._id, booking?.franchise?._id, "concluded", request);

    await BookingModel.updateOne(
      {
        _id: booking,
      },
      upBooking,
    );

    return reply.send({
      message: "Atualizado com sucesso!",
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/CompleteController.js",
      error: err?.message,
      method: "complete",
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
      message: "Não conseguimos finalizar sua solicitação",
      err: err.message,
    });
  }
};

// Liberar Motorista
const releaseDriver = async driverId => {
  // implementar regras posteriormente de libear motorista
  await DriverModel.updateOne(
    {
      _id: driverId,
    },
    {
      activeRun: [],
      activeRunStatus: "available",
    },
  );
};

// notificar usuário de corrida ativa
const realTimeNotifyUser = async (passengerId, params = {}) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}passenger/${passengerId}`).set(params);
  } catch (err) {
    console.log("err realTimeNotifyUser", err);
  }
};

// Notificar Motorista para avaliar
const realTimeNotifyDriver = async booking => {
  try {
    let priceToPaid = Number(booking?.price || 0);
    const debitPriceAdm = booking.payment && booking.payment.debitPriceAdm ? booking.payment.debitPriceAdm : 0;
    const debitPriceFranchise = booking.payment && booking.payment.debitPriceFranchise ? booking.payment.debitPriceFranchise : 0;
    const price = round(booking.price || 0, 2);
    let priceDriver = Number(booking.price || 0);

    const priceDiscountVoucher =
      booking?.payment?.priceDiscountVoucher && booking?.payment?.priceDiscountVoucher > 0 ? booking?.payment?.priceDiscountVoucher : 0;

    const valueWalletBalance = booking?.payment?.valueWalletBalance && booking?.payment?.valueWalletBalance > 0 ? booking?.payment?.valueWalletBalance : 0;

    // priceToPaid = priceToPaid - (priceDiscountVoucher + valueWalletBalance);
    priceToPaid = priceToPaid - valueWalletBalance;
    priceToPaid = Number(round(priceToPaid || 0, 2));

    if (priceToPaid < 0) {
      priceToPaid = 0;
    }

    if (debitPriceAdm && debitPriceAdm > 0) {
      priceDriver -= Number(debitPriceAdm);
    }

    if (debitPriceFranchise && debitPriceFranchise > 0) {
      priceDriver -= Number(debitPriceFranchise);
    }

    priceDriver = round(priceDriver, 2);

    const params = {
      booking: booking._id.toString(),
      paid: (booking.payment && booking.payment.typePayment === "PAGARME") || booking.payment.typePayment === "IUGU" ? true : false,
      passenger: `${booking.passenger._id}`.toString(),
      passengerName: booking.passenger.person.name || "",
      price: price,
      priceToPaid: priceToPaid,
      priceDriver: priceDriver,
      payment: `${booking.payment._id}`.toString(),
      showPrice: booking.payment.typePayment === "MONEY" ? true : false,
      type: "race_concluded",
      typePayment: getPayment(booking.payment.typePayment),
      priceDiscountVoucher: Number(round(priceDiscountVoucher || 0, 2)),
      valueWalletBalance: Number(round(valueWalletBalance || 0, 2)),
    };

    await database.ref().child(`${process.env.FIREBASE_PATH}driver/${booking.driver}`).set(params);
  } catch (err) {
    //
  }
};

// Push
const sendPushNotification = async token => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: "Obrigado por viajar conosco",
        auth: token,
      },
      params: {
        title: "Solicitação Finalizada",
        message: "Obrigado por viajar conosco",
      },
    });
  } catch (err) {
    console.log("err sendPushNotification", err);
  }
};

// fee
const serviceCharge = async booking => {
  try {
    if (!booking.payment) {
      return;
    }

    if (booking && booking.franchise) {
      // calcula as taxas
      const fee = await feeService(booking.price, booking.franchise._id, booking.service);

      if (fee) {
        await PaymentModel.updateOne(
          { _id: booking.payment },
          {
            feeAdm: fee.feeAdm,
            feeAdmValue: fee.feeAdmValue,
            debitPriceAdm: fee.debitPriceAdm,
            feeFranchise: fee.feeFranchise,
            feeFranchiseValue: fee.feeFranchiseValue,
            debitPriceFranchise: fee.debitPriceFranchise,
          },
        );
      }
    }

    return;
  } catch (err) {
    console.log("fail serviceCharge", err);
  }
};

const getPayment = typePayment => {
  switch (typePayment) {
    case "MONEY":
      return "Dinheiro";
    case "CARD":
      return "Maquininha Motorista";
    case "PAGARME":
      return "Pago pelo App";
    case "PIX":
      return "Pago pelo App";
    case "BRASPAG":
      return "Pago pelo App";
    case "IUGU":
      return "Pago pelo App";
  }

  return "";
};

const setRouteComplete = async (
  booking,
  driver,
  // appversion,
  tripDistance,
  request,
) => {
  try {
    booking.tripDistance = tripDistance;

    if (!booking?.historicAction?.stop[0]?.date) {
      return {
        status: false,
        message: "Não foi encontrado nenhum destino",
        isToRecalculate: false,
      };
    }

    const startDate = moment(booking?.historicAction?.stop[0]?.date).utc(false).subtract(10, "seconds").toDate();
    const endDate = moment(booking?.historicAction?.finishedRace?.date).utc(false).add(10, "seconds").toDate();

    const filter = {
      driver: mongoose.Types.ObjectId(driver),
      $and: [
        {
          createdAt: { $lte: endDate },
        },
        {
          createdAt: { $gte: startDate },
        },
      ],
    };

    const listPositions = await DriverLocationModel.aggregate([
      {
        $match: filter,
      },
      {
        $sort: {
          "location.date": 1,
        },
      },
      {
        $project: {
          location: 1,
          createdAt: 1,
          distance: 1,
          travelledDistance: 1,
        },
      },
    ]);

    const respRouteComplet = await routeCompleted(listPositions, startDate, endDate, booking);

    if (!respRouteComplet || respRouteComplet?.status === false) {
      await TravelBookingInfoModel.findOneAndUpdate(
        {
          booking: booking?._id,
        },
        {
          driver: driver,
          predictedPrice: booking.price,
          status: "concluded",
        },
        {
          upsert: true,
          new: true,
        },
      );

      return respRouteComplet;
    }

    const travelledDistance = Number(Number(`${Number(respRouteComplet?.distance || 0) * 1000}`).toFixed(2));
    const travelledTime = respRouteComplet?.time || 0;
    const polylineEnd = respRouteComplet?.polylineEnd;

    const payloadTravel = {
      driver: driver,
      predictedPrice: booking.price,
      travelledDistance: travelledDistance,
      travelledTime: travelledTime,
      polylineEnd: polylineEnd,
      status: "concluded",
    };

    let recalculate = null;

    if (
      booking?.franchise?.settingsRace?.recalculate?.status === true ||
      `${request?.query?.debug}` === "true"
      //  &&  appversion  && parseFloat(`${appversion}`.replace(/\./g, '')) >= 1040
    ) {
      recalculate = await recalculatePrice(booking, travelledDistance, travelledTime, request);
    }

    if (recalculate === null && !request?.query?.debug) {
      await TravelBookingInfoModel.findOneAndUpdate(
        {
          booking: booking?._id,
        },
        payloadTravel,
        {
          upsert: true,
          new: true,
        },
      );

      return;
    }

    if (recalculate && recalculate?.price) {
      payloadTravel.travelledPrice = recalculate?.price;
    }

    if (recalculate && recalculate?.calculationBasis) {
      payloadTravel.travelledCalculationBasis = recalculate?.calculationBasis;
    }

    const respTravel = await TravelBookingInfoModel.findOneAndUpdate(
      {
        booking: booking?._id,
      },
      payloadTravel,
      {
        upsert: true,
        new: true,
      },
    ).lean();

    if (respRouteComplet?.isToRecalculate && recalculate?.isToRecalculate) {
      respTravel.isToRecalculate = true;
    }

    return respTravel;
  } catch (err) {
    console.log("fail", err);

    return null;
  }
};

const recalculatePrice = async (booking, distance, duration, request) => {
  try {
    const recalculate = booking?.franchise?.settingsRace?.recalculate || {};
    let isToRecalculate = true;

    if (!recalculate || !recalculate?.timeAbove || !recalculate?.timeBelow || !recalculate?.distanceAbove || !recalculate?.distanceBelow) {
      console.log("falta dados recalculo");
      return null;
    }

    const travelBooking = await TravelBookingInfoModel.findOne({
      booking: booking?._id,
    })
      .select({
        predictedTime: 1,
        predictedDistance: 1,
      })
      .lean();

    if (!travelBooking || !travelBooking?._id) {
      console.log("travelBooking not found");
      return null;
    }

    let permitted = false;
    const timeAbove = recalculate?.timeAbove || 0; // Minutos
    const timeBelow = recalculate?.timeBelow || 0; // Minutos
    const predictedTime = (travelBooking?.predictedTime || 0) / 60; // Minuto

    const distanceAbove = recalculate?.distanceAbove || 0; // Metros
    const distanceBelow = recalculate?.distanceBelow || 0; // Metros
    const predictedDistance = travelBooking?.predictedDistance || 0; // Metros

    const minDistance = predictedDistance - distanceBelow;
    const maxDistance = predictedDistance + distanceAbove;

    let difDistance = null;
    let difTime = null;

    if (distanceAbove < 400 || distanceBelow < 400) {
      isToRecalculate = false;
      // return null;
    }

    // Minuto Acima
    if (duration / 60 - timeAbove > predictedTime) {
      permitted = true;
    }

    // Minuto Abaixo
    if (duration / 60 < predictedTime && duration / 60 + timeBelow < predictedTime) {
      permitted = true;
    }

    // Mediana
    if (distance >= minDistance && distance <= maxDistance) {
      isToRecalculate = false;
      // return null;
    }

    // Distancia acima
    if (distance + distanceAbove > predictedDistance) {
      permitted = true;
    }

    // distancia mínima abaixo aceitável
    if (distance < minDistance) {
      const minDistAccept = minDistance * 0.7; // 70%

      if (distance < minDistAccept) {
        isToRecalculate = false;
        // return null;
      }

      permitted = true;
    }

    if (permitted === false) {
      isToRecalculate = false;
      // return null;
    }

    if (distance && predictedDistance) {
      difDistance = distance - predictedDistance;
      difDistance = parseInt(`${difDistance}`);
    }

    if (duration && travelBooking?.predictedTime) {
      difTime = duration - travelBooking?.predictedTime;
      difTime = parseInt(`${difTime}`);
    }

    let timeZone = "America/Sao_Paulo";

    if (booking?.service.timeZone) {
      timeZone = booking?.service.timeZone;
    }

    let service = await getServices({
      _id: new mongoose.Types.ObjectId(booking?.service?._id),
    });

    if (service && Array.isArray(service) && service.length > 0) {
      service = service[0];
    }

    if (!service?._id) {
      console.log("fail Routecomplete getServices()");

      return null;
    }

    const dataTime = moment(booking?.createdAt).tz(timeZone);
    const infoRace = {
      distance: distance,
      duration: duration,
      tagCost: booking?.tagCost || 0,
    };

    const estPrc = estimatedPrice(service, infoRace, dataTime);
    service.price = estPrc.price;

    const dynamicPrc = await dynamicPrice(service, infoRace, moment(booking?.createdAt).utc(false), {
      latitude: booking?.origin?.coordinates[1] || 0,
      longitude: booking?.origin?.coordinates[0] || 0,
    });

    service.price = dynamicPrc.price;
    const percent = dynamicPrc.percent || estPrc.percent;

    if (estPrc?.calculationBasis) {
      estPrc.calculationBasis.dynamicPrice = {
        totalOld: estPrc.price || 0,
        percentOld: estPrc.percent || 0,
        total: dynamicPrc?.price || 0,
        percent: dynamicPrc.percent || 0,
      };
    }

    return {
      price: service.price,
      percent: percent,
      calculationBasis: estPrc?.calculationBasis,
      difDistance,
      difTime,
      isToRecalculate: isToRecalculate,
    };
  } catch (err) {
    await LogModel.create({
      path: "src/service/maps/routeCompleted.ts",
      error: err?.message,
      method: "recalculatePrice",
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
      },
    });
    console.error(err);

    return null;
  }
};

module.exports = complete;
