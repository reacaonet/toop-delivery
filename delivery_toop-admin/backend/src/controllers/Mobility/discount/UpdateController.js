const moment = require("moment");

/** Model */
const VoucherModel = require("../../../models/Mobility/Payment/VoucherModel");
const LogModel = require("../../../models/LogModel");

const updateController = async (request, reply) => {
  try {
    const { id } = request.params;
    const data = request.body;

    if (data.startDate) {
      data.startDate = moment(data.startDate, true).utc(false).startOf("day").toDate();
    }

    if (data.endDate) {
      data.endDate = moment(data.endDate, true).utc(false).endOf("day").toDate();
    }

    await VoucherModel.updateOne({ _id: id }, data);

    return reply.send({
      message: "Alterado!!",
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/v1/mobility/discount/UpdateController.ts",
      error: err?.message,
      method: "updateController",
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

    return reply.status(400).send({
      err: err.message,
      message: "Não foi possível atualizar",
    });
  }
};

module.exports = updateController;
