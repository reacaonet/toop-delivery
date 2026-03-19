const cron = require("cron");
const moment = require("moment");
const mongoose = require("mongoose");

const AccountBalanceModel = require("../models/Finance/DigitalAccounts/AccountBalanceModel");
const AccountModel = require("../models/Finance/DigitalAccounts/AccountModel");
const BankTransactionsModel = require("../models/Finance/DigitalAccounts/BankTransactionsModel");

const AccountBalance = () => {
  const CronJob = cron.CronJob;

  const job = new CronJob("*/2 * * * *", createBalance, null, true, "America/Sao_Paulo");

  job.start();
};

const createBalance = async () => {
  try {
    const currentDate = moment.utc().subtract(3, "hours").format("YYYY-MM-DD");
    const yesterdayDate = moment.utc().subtract(3, "hours").subtract(1, "days").format("YYYY-MM-DD");

    const accounts = await AccountModel.find({
      deletedAt: { $exists: false },
    });

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];

      let balancePrev = 0;
      let balance = 0;

      // soma os balaço do dia atual
      const data = await BankTransactionsModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentDate}T00:00:00.000Z`),
              $lte: new Date(`${currentDate}T23:59:59.000Z`),
            },
            status: "COMPLETED",

            $and: [
              {
                $or: [
                  {
                    originAccount: mongoose.Types.ObjectId(account._id),
                  },
                  {
                    destinationAccount: mongoose.Types.ObjectId(account._id),
                  },
                ],
              },
            ],
          },
        },
        {
          $group: {
            _id: 1,
            input: {
              $sum: {
                $cond: {
                  if: { $eq: ["$type", "credit"] },
                  then: "$value",
                  else: 0,
                },
              },
            },
            output: {
              $sum: {
                $cond: {
                  if: { $eq: ["$type", "debit"] },
                  then: "$value",
                  else: 0,
                },
              },
            },
          },
        },
      ]);

      const yesterdayData = await AccountBalanceModel.findOne({
        date: {
          $gte: new Date(`${yesterdayDate}T00:00:00.000Z`),
          $lte: new Date(`${yesterdayDate}T23:59:59.000Z`),
        },
        account: account._id,
      });

      balancePrev = yesterdayData ? yesterdayData.balance : 0;
      const inputs = data[0] ? data[0].input : 0;
      const outputs = data[0] ? data[0].output : 0;

      balance = inputs - outputs + balancePrev;

      const cashBalance = await AccountBalanceModel.findOneAndReplace(
        {
          date: {
            $gte: new Date(currentDate),
            $lte: new Date(currentDate),
          },
          account: account._id,
        },
        {
          date: currentDate,
          account: account.id,
          prevBalance: balancePrev,
          inputs: inputs,
          outputs: outputs,
          balance: balance,
        },
      );

      if (!cashBalance) {
        const cashBalance = await AccountBalanceModel.create({
          date: currentDate,
          account: account._id,
          prevBalance: balancePrev,
          inputs: inputs,
          outputs: outputs,
          balance: balance,
        });
      }
    }
  } catch (err) {
    console.log("Fail account Balance", err);
    return null;
  }
};

module.exports = { AccountBalance, createBalance };
