const cron = require("cron");
const moment = require("moment");
const mongoose = require("mongoose");
// const axios = require('axios');

/** Model */
const OrderModel = require("../models/Shopping/order/orderStatusModel");
const CampaignModel = require("../models/Cashback/CashbackCampaignModel");
const CashCustomerModel = require("../models/Cashback/CashbackCustomerModel");
const CustomerModel = require("../models/CustomerModel");

const CashbackCustomerBalanceModel = require("../models/Cashback/CashbackCustomerBalanceModel");

const CashBackCron = () => {
  const CronJob = cron.CronJob;
  const job = new CronJob(`*/1 * * * *`, runCashBack, null, true, "America/Sao_Paulo");

  job.start();
};

const CashBackBalanceCron = () => {
  const CronJob = cron.CronJob;

  const job = new CronJob(
    // `* */50 */23 * *`,
    `*/2 * * * *`,
    createBalance,
    null,
    true,
    "America/Sao_Paulo",
  );

  job.start();
};

const runCashBack = async () => {
  try {
    const orders = await OrderModel.aggregate([
      {
        $match: {
          status: "FINISHED",
          cashBackProcess: false,
        },
      },
      {
        $project: {
          status: 1,
          payment: 1,
          company: 1,
          typePayment: 1,
          customer: 1,
          cashBackProcess: 1,
        },
      },
      {
        $lookup: {
          from: "payment",
          let: { id: "$payment" },
          as: "payment",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$id"] },
              },
            },
            {
              $project: {
                order: 1,
                total: 1,
                usedCashback: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          "payment._id": { $exists: true },
          "payment.total": { $exists: true },
        },
      },
    ]);

    if (!orders || orders.length <= 0) {
      return;
    }

    const date = moment().startOf("day").utc(false).toDate();

    for await (const order of orders) {
      const campaing = await getCampaing(order, date); // Campanha Ativa

      // registra o uso do cashback
      if (order.payment.usedCashback > 0) {
        const usedCashback = Number(order.payment.usedCashback);
        await createCash(order, null, 0, usedCashback * -1);
      }

      if (campaing && campaing._id) {
        const percent = campaing.percent ? Number(campaing.percent) : 0;
        const paymentTotal = Number(order.payment.total);
        const totalCash = Number(Number(paymentTotal * (percent / 100)).toFixed(2));

        const create = await createCash(order, campaing, percent, totalCash);

        if (create && create._id) {
          await OrderModel.updateOne({ _id: order._id }, { cashBackProcess: true });

          // atualiza o saldo da campanha
          await CampaignModel.updateOne({ _id: campaing._id }, { balance: campaing.balance - totalCash });
        }
      }
    }

    return;
  } catch (err) {
    console.log("Fail", err);
    return;
  }
};

const getCampaing = async (order, date) => {
  try {
    let campaing = null;

    campaing = await CampaignModel.findOne({
      companies: order.company,
      status: true,
      endDate: {
        $gte: date,
      },
      startDate: {
        $lte: date,
      },
      deletedAt: {
        $exists: false,
      },
    }).lean();

    if (campaing && campaing._id) {
      return campaing;
    }

    campaing = await CampaignModel.findOne({
      status: true,
      allApp: true,
      endDate: {
        $gte: date,
      },
      startDate: {
        $lte: date,
      },
      deletedAt: {
        $exists: false,
      },
    }).lean();

    return campaing;
  } catch (err) {
    console.log("oops fail", err);
    return null;
  }
};

const createCash = async (order, campaing, percent, totalCash) => {
  try {
    const cashCustomer = await CashCustomerModel.create({
      customer: order.customer,
      payment: order.payment._id,
      order: order._id,
      campaign: campaing ? campaing._id : null,
      percent: percent,
      cash: totalCash,
    });

    return cashCustomer;
  } catch (err) {
    console.log("Fail createCash", err);
    return null;
  }
};

const createBalance = async () => {
  try {
    const currentDate = moment().utc().subtract(3, "hours").format("YYYY-MM-DD");
    const yesterdayDate = moment().utc().subtract(3, "hours").subtract(1, "days").format("YYYY-MM-DD");

    const customers = await CustomerModel.find({
      deletedAt: { $exists: false },
    });

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];

      let cashPrev = 0;
      let cash = 0;

      // soma os cash do dia atual
      const data = await CashCustomerModel.aggregate([
        {
          $project: {
            createdAt: 1,
            cash: 1,
            customer: 1,
            date: {
              $subtract: ["$createdAt", 60000 * 60 * 3], // subtrai 3 horas
            },
          },
        },
        {
          $match: {
            date: {
              $gte: new Date(`${currentDate}T00:00:00.000Z`),
              $lte: new Date(`${currentDate}T23:59:59.000Z`),
            },
            customer: customer._id,
          },
        },
        {
          $group: {
            _id: 1,
            total: {
              $sum: {
                $ifNull: ["$cash", 0],
              },
            },
          },
        },
      ]);

      const yesterdayData = await CashbackCustomerBalanceModel.findOne({
        date: {
          $gte: new Date(`${yesterdayDate}T00:00:00.000Z`),
          $lte: new Date(`${yesterdayDate}T23:59:59.000Z`),
        },
        customer: customer._id,
      });

      cashPrev = yesterdayData ? yesterdayData.cash : 0;
      cash = (data[0] ? data[0].total : 0) + cashPrev;

      const cashBalance = await CashbackCustomerBalanceModel.findOneAndReplace(
        {
          date: {
            $gte: new Date(`${currentDate}T00:00:00.000Z`),
            $lte: new Date(`${currentDate}T23:59:59.000Z`),
          },
          customer: customer._id,
        },
        {
          date: currentDate,
          customer: customer._id,
          cashPrev: cashPrev,
          cash: cash,
        },
      );

      if (!cashBalance) {
        const cashBalance = await CashbackCustomerBalanceModel.create({
          date: currentDate,
          customer: customer._id,
          cashPrev: cashPrev,
          cash: cash,
        });
      }
    }
  } catch (err) {
    console.log("Fail createCash Balance", err);
    return null;
  }
};

module.exports = { CashBackCron, CashBackBalanceCron };
