const mongoose = require("mongoose");
const moment = require("moment");

/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const listStatus = async (request, reply) => {
  try {
    const { isRoot, franchise: loggedFranchise } = request;
    const { online, onRoute, franchiseId, startDate, endDate, runStatus, latitude, longitude, radius } = request.query;

    const zoneH = -3;
    const filter = {};

    if (!isRoot) {
      filter.franchise = new mongoose.Types.ObjectId(loggedFranchise);
    } else if (franchiseId) {
      filter.franchise = new mongoose.Types.ObjectId(franchiseId);
    }

    if (online) {
      if (online === "true") {
        filter.online = true;
      } else {
        filter.online = false;
      }
    }

    if (onRoute) {
      filter.activeRunStatus = {
        $in: ["race_accepted", "race_in_progress"],
      };
    }

    if (startDate && endDate) {
      filter.updatedAt = {
        $gte: moment(`${startDate} 00:00:00`).utcOffset(zoneH, true).toDate(),
        $lte: moment(`${endDate} 23:59:59`).utcOffset(zoneH, true).toDate(),
      };
    } else {
      filter.updatedAt = {
        $gte: moment().utc(false).subtract(1440, "hours").toDate(),
      };
    }

    if (runStatus) {
      filter.activeRunStatus = `${runStatus}`.trim();
    }

    filter.deletedAt = {
      $exists: false,
    };

    const aggregate = [];

    if (radius && radius > 0 && latitude && longitude) {
      aggregate.push({
        $geoNear: {
          query: filter, // is change -> $match: filter
          key: "location",
          near: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          distanceField: "distance",
          maxDistance: Number(radius),
          spherical: true,
          distanceMultiplier: 0.001, // convert in KM
          // includeLocs: 'dist.location',
        },
      });
    } else {
      aggregate.push({
        $match: filter,
      });
    }

    const list = await DriverModel.aggregate(aggregate);

    return reply.send(list);
  } catch (err) {
    console.log("err", err);

    // await LogModel.create({
    //   path: "src/controllers/Mobility/driver/ListStatusController.js",
    //   error: err?.message,
    //   method: "listStatus",
    //   type: "error",
    //   level: 0,
    //   origin: "backend",
    //   request: {
    //     application: request?.application,
    //     franchise: request?.franchise,
    //     company: request?.company,
    //     params: request?.params,
    //     body: request?.body,
    //     query: request?.query,
    //     heders: request?.heders,
    //     method: request?.method,
    //     url: request?.url,
    //   },
    // });

    return reply.status(400).send({
      message: "Falha ao encontrar Driver",
      err: err.message,
    });
  }
};

module.exports = listStatus;
