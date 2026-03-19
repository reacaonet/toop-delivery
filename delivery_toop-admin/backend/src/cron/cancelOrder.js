const cron = require("cron");
const moment = require("moment");
const axios = require("axios");
const OrderStatus = require("../models/Shopping/order/orderStatusModel");

const maxTime = 25; // in minute

const CancelOrder = () => {
  const CronJob = cron.CronJob;
  const job = new CronJob("*/3 * * * *", runCancel, null, true, "America/Sao_Paulo");

  job.start();
};

const runCancel = async () => {
  try {
    const dataCurrent = moment().utc(false).subtract(maxTime, "minutes").toDate();

    let listOrder = await OrderStatus.aggregate([
      {
        $match: {
          status: "WAIT_COMPANY",
          createdAt: { $lt: dataCurrent },
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          createdAt: 1,
          shoppingCart: 1,
          order_number: 1,
        },
      },
      {
        $lookup: {
          from: "shoppingCart",
          let: { cartId: "$shoppingCart" },
          as: "shoppingCart",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$cartId"] },
              },
            },
            {
              $project: {
                schedule: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$shoppingCart", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          "shoppingCart.schedule": { $exists: false },
        },
      },
      {
        $limit: 100,
      },
    ]);

    // let listOrder = await OrderStatus.find({
    //   status: 'WAIT_COMPANY',
    //   createdAt: { $lt: dataCurrent }
    // })
    // .select({
    //   _id: 1,
    //   status: 1,
    //   createdAt: 1,
    //   order_number: 1,
    // })
    // .sort({
    //   createdAt: 1,
    // })
    // .limit(50)
    // .lean();

    if (!listOrder || listOrder.length <= 0) {
      // console.log('nenhum resultado encontrado ....');
      return;
    }

    for await (const order of listOrder) {
      try {
        // console.log('Id da Order para cancelar', order._id, order.order_number);
        await axios.put(`${process.env.HOST}:${process.env.PORT}/payment/cancel/order/${order._id}`, {});
      } catch (err) {
        console.log("Fail Cancel Order ....", err.message);
      }
    }
  } catch (err) {
    console.log("Fail", err);
    return;
  }
};

module.exports = CancelOrder;
