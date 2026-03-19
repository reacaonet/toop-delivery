/** Model */
const TravelBookingInfoModel = require("../../../models/Mobility/Booking/TravelBookingInfoModel");
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");
/** Service */
const generateDirectionImage = require("../../../services/maps/directionImage");

const listController = async (request, reply) => {
  try {
    const { booking } = request.params;

    const response = await TravelBookingInfoModel.findOne({
      booking: booking,
      status: "concluded",
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    const franchise = response?.franchise;

    const respFranchise = await FranchiseModel.findById(franchise)
      .select({
        routeSettings: 1,
      })
      .lean();

    if (
      !respFranchise ||
      !respFranchise?.routeSettings ||
      !respFranchise?.routeSettings?.showReportCardTravel ||
      respFranchise?.routeSettings?.showReportCardTravel === false
    ) {
      return reply.send(null);
    }

    if (response?.predictedTime && response?.predictedTime < 60) {
      response.predictedTime = `${response?.predictedTime} segundos`;
    } else if (response?.predictedTime >= 60) {
      response.predictedTime = `${parseInt((response?.predictedTime / 60).toString())} minutos`;
    }

    if (response?.travelledTime && response?.travelledTime < 60) {
      response.travelledTime = `${response?.travelledTime} segundos`;
    } else if (response?.travelledTime >= 60) {
      response.travelledTime = `${parseInt((response?.travelledTime / 60).toString())} minutos`;
    }

    if (response?.predictedDistance && response?.predictedDistance < 1000) {
      response.predictedDistance = `${response?.predictedDistance} M`;
    } else if (response?.predictedDistance && response?.predictedDistance >= 1000) {
      response.predictedDistance = `${(response?.predictedDistance / 1000).toFixed(2)} KM`;
    }

    if (response?.travelledDistance && response?.travelledDistance < 1000) {
      response.travelledDistance = `${response?.travelledDistance} M`;
    } else if (response?.travelledDistance && response?.travelledDistance >= 1000) {
      response.travelledDistance = `${(response?.travelledDistance / 1000).toFixed(2)} KM`;
    }

    // Imagens
    if (response && response?.polylineStart && !response?.imageStart) {
      const respImg = await generateDirectionImage("google", response?.polylineStart);

      if (respImg) {
        response.imageStart = respImg;
        await TravelBookingInfoModel.updateOne(
          { _id: response._id },
          {
            imageStart: respImg,
          },
        );
      }
    }

    // Imagens
    if (response && response?.polylineEnd && !response?.imageEnd) {
      const respImg = await generateDirectionImage("google", response?.polylineEnd);

      if (respImg) {
        response.imageEnd = respImg;
        await TravelBookingInfoModel.updateOne(
          { _id: response._id },
          {
            imageEnd: respImg,
          },
        );
      }
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/travelBooking/ListController.js",
      error: err?.message,
      method: "listController",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        franchise: request?.franchise,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    return reply.status(400).send({
      message: "Verifique as informações enviadas e tente novamente",
      err: err.message,
    });
  }
};

module.exports = listController;
