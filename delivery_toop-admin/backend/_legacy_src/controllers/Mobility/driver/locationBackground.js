/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const DriverLocationModel = require("../../../models/Mobility/Driver/DriverLocationModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const database = require("../../../services/firebase");

const locationBackground = async (request, reply) => {
  try {
    const data = request.body || {};

    if (data && Array.isArray(data) && data.length > 0) {
      const { booking, driver, latitude, longitude } = data[0] || {};

      if (driver && latitude && longitude) {
        const index = data.length - 1;

        await DriverModel.updateOne(
          { _id: driver },
          {
            location: {
              type: "Point",
              coordinates: [Number(data[index].longitude), Number(data[index].latitude)],
            },
          },
        );

        let last = null;

        for await (const coord of data) {
          if (coord?.longitude && coord?.latitude && coord?.driver) {
            if (last && coord?.longitude === last?.longitude && coord?.latitude === last?.latitude) {
              continue;
            }

            const payloadLoc = {
              type: "Point",
              coordinates: [Number(coord.longitude), Number(coord.latitude)],
            };

            if (coord?.localDate) {
              payloadLoc.date = coord?.localDate;
            }

            if (coord?.speed) {
              payloadLoc.speed = coord?.speed;
            }

            const payload = {
              driver: coord?.driver,
              location: payloadLoc,
            };

            if (coord?.booking) {
              payload.booking = coord.booking;
            }

            await DriverLocationModel.create(payload);
            last = coord;
          }
        }

        if (booking) {
          updateDriverPosition(driver, {
            latitude: Number(data[index].longitude),
            longitude: Number(data[index].latitude),
          });
        }
      }
    }

    return reply.send({
      message: "posição atualizada",
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/driver/locationBackground.js",
      error: err?.message,
      method: "locationBackground",
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
      message: "Não foi possível atualizar posição",
      err: err.message,
    });
  }
};

const updateDriverPosition = async (driverId, params) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}driver-update/${driverId}`).set(params);
  } catch (err) {
    //
  }
};

module.exports = locationBackground;
