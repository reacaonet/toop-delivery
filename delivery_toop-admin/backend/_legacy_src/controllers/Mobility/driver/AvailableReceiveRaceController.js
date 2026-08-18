const moment = require("moment");
const { Types } = require("mongoose");

/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const NotifyQueueDriverModel = require("../../../models/Mobility/Driver/NotifyQueueDriverModel");
const LogModel = require("../../../models/LogModel");

const maxDistance = process.env.MAX_DIST_DRIVER;
const waitingTime = process.env.WAITING_TIME_DRIVER;

const AvailableReceiveRaceController = async (request, reply) => {
  try {
    const { booking, latitude, longitude, service, notDrivers, raceToDriver, refused = [], radiusSendRace = null } = request.body;
    const filter = {};

    if (raceToDriver) {
      filter._id = new Types.ObjectId(raceToDriver);
    }

    filter.status = true;
    filter.online = true;
    filter.approved = true;
    filter.activeRunStatus = "available";
    filter.categoryServices = "driver";

    filter.services = {
      $in: [new Types.ObjectId(service)],
    };

    let notSendDriver = [];

    // Notificação enviadas anteriormente
    if (notDrivers && Array.isArray(notDrivers) && notDrivers.length > 0) {
      notSendDriver = notSendDriver.concat(notDrivers);
    }

    // Solicitação recusada pelo motorista
    if (refused && Array.isArray(refused) && refused.length > 0) {
      notSendDriver = notSendDriver.concat(refused);
    }

    if (notSendDriver && notSendDriver.length > 0) {
      filter._id = {
        $nin: notSendDriver.map(key => {
          return new Types.ObjectId(key);
        }),
      };
    }

    filter.$or = [
      {
        lastQueue: {
          $lt: moment().utc(false).subtract(waitingTime, "seconds").toDate(),
        },
      },
      {
        lastQueue: { $exists: false },
      },
    ];

    filter.updatedAt = {
      $gte: moment().utc(false).subtract(26, "hours").toDate(),
    };

    filter.deletedAt = {
      $exists: false,
    };

    let driver = await getDrivers(filter, latitude, longitude, radiusSendRace);

    if (driver && Array.isArray(driver) && driver.length > 0) {
      driver = driver[0];
    }

    if (driver && driver._id && driver.distance >= 0) {
      driver.routeTime = `${parseInt(Math.round((Number(driver.distance) / 40) * 60))} min`;
      driver.distance = `${Number(driver.distance).toFixed(2)} KM`;

      if (driver.routeTime < 1) {
        driver.routeTime = "1 min";
      }
    }

    if (driver && driver._id) {
      // não enviar solicitacao
      let notNotifiedDrivers = [];

      if (notDrivers && Array.isArray(notDrivers) && notDrivers.length >= 4) {
        notNotifiedDrivers = [];
      } else if (notDrivers && Array.isArray(notDrivers) && notDrivers.length > 0) {
        notNotifiedDrivers = notDrivers;
      }

      notNotifiedDrivers.push(new Types.ObjectId(driver._id));

      await BookingModel.updateOne(
        { _id: booking },
        {
          notNotifiedDrivers: notNotifiedDrivers,
        },
      );

      await DriverModel.updateOne(
        { _id: driver._id },
        {
          lastQueue: moment().utc(false).toDate(),
        },
      );

      await NotifyQueueDriverModel.create({
        booking: booking,
        driver: driver._id,
      });
    } else {
      // Motorista não encontrado
      if (notDrivers && Array.isArray(notDrivers) && notDrivers.length > 0) {
        await BookingModel.updateOne(
          { _id: booking },
          {
            notNotifiedDrivers: [],
          },
        );
      }
    }

    return reply.send(driver);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/driver/AvailableReceiveRaceController.js",
      error: err?.message,
      method: "AvailableReceiveRaceController",
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

    console.log(`Log de erro criado com sucesso.`);

    return reply.status(400).send({
      message: "Não foi possível salvar motorista",
      err: err.message,
    });
  }
};

const getDrivers = async (filter, latitude, longitude, radiusSendRace = null) => {
  let dist = Number(maxDistance);

  if (radiusSendRace && radiusSendRace > 0) {
    dist = Number(`${radiusSendRace}`) * 1000;
  }

  const driver = await DriverModel.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        maxDistance: dist,
        spherical: true,
        distanceMultiplier: 0.001, // convert in KM
        // includeLocs: 'dist.location',
      },
    },
    {
      $match: filter,
    },
    {
      $limit: 1,
    },
  ]);

  return driver;
};

module.exports = AvailableReceiveRaceController;
