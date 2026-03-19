const mongoose = require('mongoose');
/** Model */
const ChatRaceModel = require("../../../models/Mobility/Messages/chatRaceModel");
const LogModel = require("../../../models/LogModel");

const listController = async (request, reply) => {
  try {
    const { booking } = request.query;

    const response = await getMessagesBooking(booking);

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/chatMessage/listController.js',
      error: err?.message,
      method: 'listController',
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

const getMessagesBooking = async booking => {
  const filter = {
    booking: new mongoose.Types.ObjectId(booking),
  };
  const response = await ChatRaceModel.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: 'passenger',
        let: { passenger: '$passenger' },
        as: 'passenger',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$passenger'] },
            },
          },
          {
            $project: {
              _id: 1,
              person: 1,
              stars: 1,
              rating: 1,
              franchise: 1,
            },
          },
          { $limit: 1 },
        ],
      },
    },
    {
      $unwind: {
        path: '$passenger',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  return response;
};

module.exports = listController;
