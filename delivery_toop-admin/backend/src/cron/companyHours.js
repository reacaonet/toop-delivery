const cron = require("cron");
const moment = require("moment");

const CompanyHoursModel = require("../models/Company/CompanyHoursModel");
const CompanyDeliveryModel = require("../models/Company/CompanyDeliveryModel");

const cronCompanyHours = () => {
  const CronJob = cron.CronJob;

  const job = new CronJob(
    "*/5 * * * *",
    async () => {
      const date = moment().utc(false).subtract(3, "h").format("dddd").toUpperCase();
      const dateNow = moment().utc(false).subtract(3, "h").format("HHmm").toString();

      const openHours = await CompanyHoursModel.find(
        {
          dayWeek: date,
          $and: [{ openingHours: { $lte: Number(dateNow) } }, { closingHours: { $gt: Number(dateNow) } }],
        },
        {
          _id: 0,
          company: 1,
        },
      );

      if (openHours) {
        let listOpenHours = [];

        for await (const hour of openHours) {
          listOpenHours.push(hour.company);
        }

        await CompanyDeliveryModel.updateMany(
          {
            company: {
              $in: listOpenHours,
            },
            $or: [{ isManual: { $eq: false } }, { isManual: { $exists: false } }],
          },
          {
            $set: {
              isOpen: true,
            },
          },
        );

        await CompanyDeliveryModel.updateMany(
          {
            company: {
              $nin: listOpenHours,
            },
            $or: [{ isManual: { $eq: false } }, { isManual: { $exists: false } }],
          },
          {
            $set: {
              isOpen: false,
            },
          },
        );
      }
    },
    null,
    true,
    "America/Sao_Paulo",
  );

  job.start();
};

module.exports = cronCompanyHours;
