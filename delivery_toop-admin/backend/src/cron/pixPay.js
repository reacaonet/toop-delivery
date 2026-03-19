const moment = require("moment");
const axios = require("axios");
const cron = require("cron");

/** Model */
const CartModel = require("../models/Shopping/CartModel");

const PixCron = () => {
  const CronJob = cron.CronJob;
  const job = new CronJob(`*/1 * * * *`, PixPay, null, true, "America/Sao_Paulo");

  job.start();
};

const PixPay = async () => {
  try {
    const dataCurrent = moment().utc(false).toDate();
    const dataOld = moment().utc(false).subtract(13, "minutes").toDate();

    const listPix = await CartModel.find({
      status: "pending",
      pixTxid: {
        $exists: true,
      },
      $and: [
        {
          pixDate: {
            $gte: dataOld,
          },
        },
        {
          pixDate: {
            $lte: dataCurrent,
          },
        },
      ],
    }).lean();

    if (!listPix || !Array.isArray(listPix) || listPix.length <= 0) {
      return;
    }

    for await (const cart of listPix) {
      await verifyPayment(cart._id);
    }

    return;
  } catch (err) {
    console.log("fail pixpay", err);
  }
};

const verifyPayment = async cartId => {
  try {
    const { data: response } = await axios.get(`${process.env.HOST}:${process.env.PORT}/v2/pix/verify/${cartId}`);

    if (!response) {
      return null;
    }

    return response;
  } catch (err) {
    console.log("falhou", err);
    return null;
  }
};

module.exports = PixCron;
