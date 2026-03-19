const mongoose = require("mongoose");

/** Model */
const VoucherModel = require("../../../models/Mobility/Payment/VoucherModel");
const LogModel = require("../../../models/LogModel");

const paginatorController = async (request, reply) => {
  try {
    const { isRoot, franchise } = request;
    const { pageIn = 0, pageOut = 20, active } = request.query;

    const filter = {};

    if (!isRoot) {
      filter.franchise = new mongoose.Types.ObjectId(franchise);
    }

    if (`${active}` === "true" || `${active}` === "false") {
      filter.active = `${active}` === "true" ? true : false;
    }

    let list = [];
    let numTotal = 0;

    list = await VoucherModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "franchise",
          let: { franchiseId: "$franchise" },
          as: "franchise",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$franchiseId"] },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "service",
          let: { serviceId: "$service" },
          as: "service",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$serviceId"] },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$service", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: {
          active: -1,
          createdAt: -1,
        },
      },
      { $skip: parseInt(pageIn, 10) * parseInt(pageOut, 10) },
      { $limit: parseInt(pageOut, 10) },
    ]);

    numTotal = await VoucherModel.countDocuments(filter);

    return reply.send({
      list,
      total: numTotal,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/v1/mobility/discount/PaginatorController.ts",
      error: err?.message,
      method: "paginatorController",
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
      message: "Não foi possível listar Vouchers",
    });
  }
};

module.exports = paginatorController;
