const mongoose = require("mongoose");

const VehicleDocumentsDriversModel = require("../../../models/Mobility/Driver/VehicleDocumentsModel");
const LogModel = require("../../../models/LogModel");

const paginator = async (request, reply) => {
  try {
    const { pageIn = 0, pageOut = 20, searchDriver } = request.query;
    const { isRoot, franchise } = request;

    const filter = {};
    const filterDriver = {};

    if (!isRoot) {
      filterDriver["driver.franchise"] = mongoose.Types.ObjectId(franchise);
    }

    if (searchDriver) {
      filterDriver["$or"] = [
        {
          "driver.name": {
            $regex: `.*${searchDriver.toLowerCase()}.*`,
            $options: "i",
          },
        },
        {
          "driver.phone": {
            $regex: `.*${searchDriver.toLowerCase()}.*`,
            $options: "i",
          },
        },
      ];
    }

    const list = await VehicleDocumentsDriversModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "driver",
          let: { driver: "$driver" },
          as: "driver",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$driver"],
                },
              },
            },
            {
              $project: {
                name: 1,
                phone: 1,
                franchise: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$driver", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filterDriver,
      },
      {
        $sort: {
          approved: 1,
          status: 1,
          createdAt: -1,
        },
      },
      {
        $skip: parseInt(pageIn, 10) * parseInt(pageOut, 10),
      },
      {
        $limit: parseInt(pageOut, 10),
      },
    ]);

    const numTotal = await VehicleDocumentsDriversModel.find(filter).countDocuments();

    return reply.send({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/vehicleDocuments/PaginatorController.js",
      error: err?.message,
      method: "paginator",
      type: "error",
      level: 0,
      origin: "backend",
      request: {
        application: request?.application,
        franchise: request?.franchise,
        company: request?.company,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    return reply.status(400).send({
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};

module.exports = paginator;
