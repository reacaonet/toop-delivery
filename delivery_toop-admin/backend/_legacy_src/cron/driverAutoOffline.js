const cron = require("cron");
const moment = require("moment");
const DriverModel = require("../models/Mobility/Driver/DriverModel");

const maxTime = 12; // in hours

const setDriversOffline = () => {
  const CronJob = cron.CronJob;
  const job = new CronJob("0 */15 * * * *", runCancel, null, true, "America/Sao_Paulo");

  job.start();
};

const runCancel = async () => {
  try {
    const dataCurrent = moment().utc(false).subtract(maxTime, "hours").toDate();

    await DriverModel.updateMany({ updatedAt: { $lte: dataCurrent }, online: true }, { online: false });
  } catch (err) {
    console.log("Fail driver", err);
    return;
  }
};

module.exports = setDriversOffline;
