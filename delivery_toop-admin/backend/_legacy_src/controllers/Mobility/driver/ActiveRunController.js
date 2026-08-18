const { Types } = require("mongoose");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const activeRun = async (request, reply) => {
  try {
    const { driverId } = request.params;

    const booking = await BookingModel.aggregate([
      {
        $match: {
          driver: new Types.ObjectId(driverId),
          status: {
            $in: ["accepted", "in_progress"],
          },
        },
      },
      {
        $lookup: {
          from: "passenger",
          let: { id: "$passenger" },
          as: "passenger",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            { $limit: 1 },
            {
              $lookup: {
                from: "person",
                let: { id: "$person" },
                as: "person",
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$id"] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      phone: 1,
                      email: 1,
                    },
                  },
                  { $limit: 1 },
                ],
              },
            },
            {
              $project: { person: 1 },
            },
            {
              $unwind: { path: "$person", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $unwind: { path: "$passenger", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "franchise",
          let: { id: "$franchise" },
          as: "franchise",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$id"] },
              },
            },
            {
              $project: {
                showPhoneRace: 1,
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
        $addFields: {
          priorityStatus: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$status", "accepted"] },
                  then: 1,
                },
                {
                  case: { $eq: ["$status", "in_progress"] },
                  then: 2,
                },
              ],
              default: 10,
            },
          },
        },
      },
      {
        $sort: {
          priorityStatus: -1,
        },
      },
    ]);

    return reply.send(booking);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/driver/ActiveRunController.js',
      error: err?.message,
      method: 'activeRun',
      type: 'error',
      level: 0,
      origin: 'backend',
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

    console.log(`Log de erro criado com sucesso.`);

    return reply.status(400).send({
      message: "Não foi possível aceitar corrida",
      err: err.message,
    });
  }
};

module.exports = activeRun;
