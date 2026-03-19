const { Types } = require("mongoose");

/** Model */
const ChatRaceModel = require("../../../models/Mobility/Messages/chatRaceModel");
const LogModel = require("../../../models/LogModel");

const conversation = async (request, reply) => {
  try {
    const { passenger, driver } = request.query;

    let response = [];

    if (passenger) {
      response = await conversationPassenger(passenger);
    } else if (driver) {
      response = await conversationDriver(driver);
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/chatMessage/ConversationsController.js',
      error: err?.message,
      method: 'conversation',
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
      message: "Falha ao receber mensagem",
      err: err.message,
    });
  }
};

const conversationPassenger = async passenger => {
  const response = await ChatRaceModel.aggregate([
    {
      $match: {
        passenger: new Types.ObjectId(passenger),
      },
    },
    {
      $group: {
        _id: "$booking",
        driver: { $first: "$driver" },
        booking: { $first: "$booking" },
      },
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
              timeZone: 1,
              selfiePhoto: 1,
              rating: 1,
              stars: 1,
              vehicleModel: 1,
              vehicleNameplate: 1,
              vehicleManufacturer: 1,
              vehicleColor: 1,
            },
          },
          { $limit: 1 },
        ],
      },
    },
    { $unwind: { path: "$driver", preserveNullAndEmptyArrays: true } },
  ]);

  return response;
};

const conversationDriver = async driver => {
  const response = await ChatRaceModel.aggregate([
    {
      $match: {
        driver: new Types.ObjectId(driver),
      },
    },
    {
      $group: {
        _id: "$booking",
        passenger: { $first: "$passenger" },
        booking: { $first: "$booking" },
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
                    image: 1,
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
  ]);

  return response;
};

module.exports = conversation;
