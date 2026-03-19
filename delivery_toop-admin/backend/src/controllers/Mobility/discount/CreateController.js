const moment = require("moment");

/** Model */
const VoucherModel = require("../../../models/Mobility/Payment/VoucherModel");
const LogModel = require("../../../models/LogModel");

const discount = async (request, reply) => {
  try {
    // const { isRoot, franchise } = request;

    const { franchise, passenger, service, name, price, percent, startDate, endDate, type, amountAvailable, amountUsed, active } = request.body || {};

    const payload = {};

    if (name) {
      payload.name = name;
    }

    if (franchise) {
      payload.franchise = franchise;
    }

    if (passenger) {
      payload.passenger = passenger;
    }

    if (service) {
      payload.service = service;
    }

    if (price) {
      payload.price = price;
    }

    if (percent) {
      payload.percent = percent;
    }

    if (startDate) {
      payload.startDate = moment(startDate, true).utc(false).startOf("day").toDate();
    }

    if (endDate) {
      payload.endDate = moment(endDate, true).utc(false).endOf("day").toDate();
    }

    if (type) {
      payload.type = type;
    }

    if (amountAvailable) {
      payload.amountAvailable = amountAvailable;
    }

    if (amountUsed) {
      payload.amountUsed = amountUsed;
    }

    if (`${active}` === "true" || `${active}` === "false") {
      payload.active = `${active}` === "true" ? true : false;
    }

    console.log("payload", payload);

    const voucher = await VoucherModel.create(payload);

    return reply.send(voucher);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/v1/mobility/discount/CreateController.ts",
      error: err?.message,
      method: "discount",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    reply.status(400).send({
      err: err.message,
      message: "não foi possível criar o voucher",
    });
  }
};

module.exports = discount;
