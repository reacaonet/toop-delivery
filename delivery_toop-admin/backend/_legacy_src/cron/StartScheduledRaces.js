const cron = require("cron");
const moment = require("moment");
const axios = require("axios");
/** Model */
const BookingModel = require("../models/Mobility/Booking/BookingModel");
const LogModel = require("../models/LogModel");
/** Service */
const apiPushNotification = require("../services/notification");

const startScheduledRaces = () => {
  try {
    const CronJob = cron.CronJob;
    // const job = new CronJob("*/30 * * * * *", runStartScheduledRaces, null, true, "America/Sao_Paulo"); // 30s
    const job = new CronJob("*/1 * * * *", runStartScheduledRaces, null, true, "America/Sao_Paulo"); // 1m
    job.start();
  } catch (err) {
    console.log("fail init cron scheduled races: ", err.message);
  }
};

const runStartScheduledRaces = async () => {
  try {
    // console.log("iniciado em", moment().utc(true).format("HH:mm:ss"));
    const current = moment().utc(false).toDate();

    const bookings = await BookingModel.find({
      status: "scheduled",
      startRaceAt: { $lte: current },
    })
      .select({ _id: 1, driver: 1 })
      .populate("driver", "_id token")
      .populate("application", "cloud_messaging_token")
      .limit(80)
      .lean();

    for await (const item of bookings) {
      try {
        if (item?.driver?.token) {
          console.log("url", `${process.env.HOST}:${process.env.PORT}/v1/mobility/driver/accept-race`);

          await axios.post(`${process.env.HOST}:${process.env.PORT}/v1/mobility/driver/accept-race`, {
            bookingId: item._id,
            driverId: item.driver._id,
          });

          await sendPushNotification(item.driver.token, "Sua corrida iniciou!", "Vá em direção ao passageiro", item._id);
        }
      } catch (err) {
        await LogModel.create({
          path: "src/cron/StartScheduledRaces.js",
          error: err?.message,
          method: "runStartScheduledRaces",
          type: "error",
          level: 0,
          origin: "backend",
          request: {},
        });
      }
    }
  } catch (err) {
    await LogModel.create({
      path: "src/cron/StartScheduledRaces.js",
      error: `fail cron scheduled races:  ${err?.message}`,
      method: "runStartScheduledRaces",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        ...item,
      },
    });
  }
};

const sendPushNotification = async (token, title, message, bookingId) => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: message,
        auth: token,
      },
      params: {
        type: "SCHEDULED_RACE",
        title: title,
        message: message,
        bookingId,
      },
    });
  } catch (err) {
    console.log("err:sendPushNotification:startScheduledRaces", err);
  }
};

module.exports = startScheduledRaces;
