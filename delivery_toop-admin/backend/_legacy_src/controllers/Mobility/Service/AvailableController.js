const { Types } = require("mongoose");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

/** Model */
const ServiceModel = require("../../../models/Mobility/Service/ServiceModel");
const PersonModel = require("../../../models/Person/PersonModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const VoucherModel = require("../../../models/Mobility/Payment/VoucherModel");
const TravelBookingInfoModel = require("../../../models/Mobility/Booking/TravelBookingInfoModel");
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const { directions, directionsTool } = require("../../../services/maps/directions");

/** Util */
const { estimatedPrice, dynamicPrice } = require("../../../utils");

const availableController = async (request, reply) => {
  try {
    const {
      person,
      passenger,
      origenLatitude,
      origenLongitude,
      destinyLatitude,
      destinyLongitude,
      // franchise,
      additionalStops = null,
      driver = null,
      serviceType = null,
    } = request.query || {};

    const timeZone = "America/Sao_Paulo";
    const zoneH = -3;

    const filter = {};

    const origin = {
      latitude: origenLatitude,
      longitude: origenLongitude,
    };

    const destiny = {
      latitude: destinyLatitude,
      longitude: destinyLongitude,
    };

    const franchise = await FranchiseModel.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(origenLongitude), Number(origenLatitude)],
          },
        },
      },
      deletedAt: {
        $exists: false,
      },
    }).select({
      _id: 1,
    });

    // serviços por motorista
    if (driver && Types.ObjectId.isValid(driver)) {
      const driverResp = await DriverModel.findById(driver)
        .select({
          services: 1,
        })
        .lean();

      if (driverResp && driverResp.services) {
        filter._id = {
          $in: driverResp.services,
        };
      }
    }

    // Filtrar por franquia
    if (franchise && franchise?._id) {
      filter.franchise = new Types.ObjectId(franchise?._id);
    }

    // tipo
    if (serviceType && `${serviceType}`.length > 2) {
      filter.type = serviceType;
    }

    if (person) {
      const respPerson = await PersonModel.findById(person)
        .select({
          genre: 1,
        })
        .lean();

      if (!respPerson || !respPerson.genre || respPerson.genre !== "M") {
        filter.onlyForWomen = {
          $ne: true,
        };
      }
    } else {
      filter.onlyForWomen = {
        $ne: true,
      };
    }

    filter.status = true;
    filter.deletedAt = { $exists: false };

    let listService = await getServices(filter);

    const vouchers = await getVoucher({
      services: listService,
      passenger,
    });

    if (vouchers && Array.isArray(vouchers) && vouchers.length > 0) {
      listService = await servicesHaveVoucher(listService, vouchers);
    }

    // return reply.send({
    //   services: listService,
    // });

    const newList = [];
    const infoRace = await getDuratinAndDistance(origin, destiny, additionalStops);
    let dataTime = moment().tz(timeZone);

    for await (const service of listService) {
      if (service.timeZone) {
        dataTime = moment().tz(service.timeZone);
      }

      if (infoRace) {
        const time = infoRace.duration;
        service.routeTime = "";

        if (service.franchise) {
          service.onlyMultiplesOf50 = service.franchise.onlyMultiplesOf50;
        } else {
          service.onlyMultiplesOf50 = false;
        }

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

        const estPrc = estimatedPrice(service, infoRace, dataTime);
        service.price = estPrc.price;
        const dynamicPrc = await dynamicPrice(service, infoRace, dataTime, origin);

        service.price = dynamicPrc.price;

        const additionalStopsLength =
          typeof additionalStops == "string" ? additionalStops.split("|").filter(as => as && as.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/)).length : 0;

        // CALCULO DOS PREÇOS DAS PARADAS ADICIONAIS
        if (
          typeof service.franchise?.settingsDriver?.activePercentService == "boolean" &&
          !service.franchise?.settingsDriver?.activePercentService &&
          // && service.franchise?.settingsDriver?.creditEnableMode
          // && service.franchise?.settingsDriver?.passAdditionalStopsToPassenger
          service.franchise?.settingsDriver?.creditAmountPerRice &&
          service.franchise?.settingsDriver?.creditAmountPerAdditionalStop &&
          additionalStopsLength
        )
          service.price =
            service.price +
            service.franchise.settingsDriver.creditAmountPerRice * service.franchise.settingsDriver.creditAmountPerAdditionalStop * additionalStopsLength;

        if (service?.voucher && service?.voucher?._id) {
          const respVoucher = getVoucherPrice(service.price, service?.voucher);

          if (respVoucher) {
            service.voucher = respVoucher;
          }
        }

        newList.push(service);
      }
    }

    // Travel Booking add
    await setTravelBooking(franchise, passenger, infoRace);

    return reply.send(newList);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/Service/AvailableController.js",
      error: err?.message,
      method: "availableController",
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
      message: "não conseguimos obter a lista",
      err: err.message,
    });
  }
};

const getDuratinAndDistance = async (origin, destiny, additionalStops) => {
  try {
    const coordOrigin = `${origin.latitude},${origin.longitude}`;
    const coordDestiny = `${destiny.latitude},${destiny.longitude}`;
    let waypoints = null;

    if (additionalStops && `${additionalStops}`.length > 5) {
      waypoints = `${additionalStops}`.replace(/\|$/, "");
    }

    const response = await directions(coordOrigin, coordDestiny, waypoints);

    if (!response || response.status !== 200 || !response.data) {
      return null;
    }

    const { distance, duration, overviewPolyline } = response;

    return {
      distance,
      duration,
      overviewPolyline,
    };
  } catch (err) {
    return null;
  }
};

const getVoucher = async params => {
  try {
    const filter = {};
    const dateCurrent = moment().utc(false).startOf("day").toDate();

    filter.active = true;

    filter.startDate = {
      $lte: dateCurrent,
    };

    filter.endDate = {
      $gte: dateCurrent,
    };

    filter["$or"] = [];

    const listIdServices = params.services.map(item => {
      return item._id;
    });

    filter["$or"].push({
      service: {
        $in: listIdServices,
      },
    });

    filter["$or"].push({
      service: {
        $exists: false,
      },
    });

    if (params.passenger) {
      filter["$or"].push({
        passenger: new mongoose.Types.ObjectId(params.passenger),
      });
    }

    const response = await VoucherModel.aggregate([
      {
        $match: filter,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    if (!response || response.length <= 0) {
      return null;
    }

    return response;
  } catch (err) {
    // console.log('err', err);

    return null;
  }
};

const servicesHaveVoucher = async (listService, vouchers) => {
  for await (const item of listService) {
    for (const voucher of vouchers) {
      if (voucher?.service && `${voucher?.service}`.toString() === `${item._id}`.toString()) {
        item.voucher = voucher;
      } else if (!voucher?.service) {
        item.voucher = voucher;
      }
    }
  }

  return listService;
};

const getVoucherPrice = (price, voucher) => {
  let amount = 0;
  let priceWithVoucher = price;

  if (voucher?.price && voucher?.price > 0) {
    if (price <= voucher?.price) {
      amount = price;
      priceWithVoucher = 0;
    } else {
      amount = voucher?.price;
      priceWithVoucher = price - amount;
    }
  } else if (voucher?.percent && voucher?.percent > 0) {
    amount = price * (voucher?.percent / 100);
    priceWithVoucher = price - amount;
  }

  if (amount === 0) {
    return null;
  }

  return {
    _id: voucher?._id,
    total: amount,
    isPrice: voucher?.price && voucher?.price > 0 ? true : false,
    isPercent: voucher?.percent && voucher?.percent > 0 ? true : false,
    percent: voucher?.percent && voucher?.percent > 0 ? voucher?.percent : 0,
    priceWithVoucher,
  };
};

const setTravelBooking = async (franchise, passenger, infoRace) => {
  try {
    if (passenger && Types.ObjectId.isValid(passenger) && infoRace?.overviewPolyline?.points) {
      await TravelBookingInfoModel.create({
        franchise: franchise,
        passenger: passenger,
        polylineStart: infoRace?.overviewPolyline?.points,
        predictedDistance: infoRace?.distance || 0,
        predictedTime: infoRace?.duration || 0,
      });
    }
  } catch (err) {
    return;
  }
};

const getServices = async filter => {
  let listService = await ServiceModel.aggregate([
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
        showArrivalTime: 1,
        info: 1,
        showArrivalTime: 1,
        useDynamicsRace: 1,
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
      $lookup: {
        from: "franchise",
        let: { franchise: "$franchise" },
        as: "franchise",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$franchise"],
              },
            },
          },
          {
            $project: {
              onlyMultiplesOf50: 1,
              settingsDriver: 1, // // Utilizado para repassar valor das paradas ao cliente.
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true } },
  ]);

  return listService;
};

module.exports = availableController;
module.exports.getServices = getServices;
