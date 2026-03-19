/**  */
const moment = require("moment");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const waitingTime = process.env.WAITING_TIME_DRIVER;

const queueBooking = async (request, reply) => {
  try {
    // const {} = request.query;
    const filter = {
      status: "waiting",
      $or: [
        {
          lastQueue: {
            $lt: moment().utc(false).subtract(waitingTime, "seconds").toDate(),
          },
        },
        {
          lastQueue: { $exists: false },
        },
      ],
    };

    const queue = await BookingModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "service",
          let: { id: "$service" },
          as: "service",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$id"] } },
            },
            { $limit: 1 },
            {
              $project: {
                name: 1,
                radiusSendRace: 1,
                howManyDriver: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "paymentDriver",
          let: {
            idPayment: "$payment",
            directPayment: "$directPayment",
          },
          as: "payment",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$idPayment"] } },
            },
            { $limit: 1 },
            {
              $project: {
                debitPriceAdm: 1,
                debitPriceFranchise: 1,
                typePayment: 1,
                typePaymentTxt: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$$directPayment", "MONEY_DRIVER"] },
                        then: "Dinheiro",
                      },
                      {
                        case: { $eq: ["$$directPayment", "PIX_DRIVER"] },
                        then: "Pix direto Motorista",
                      },
                      {
                        case: { $eq: ["$$directPayment", "CARD_DRIVER"] },
                        then: "Cartão direto ao motorista",
                      },
                      {
                        case: { $eq: ["$typePayment", "MONEY"] },
                        then: "Dinheiro",
                      },
                      {
                        case: { $eq: ["$typePayment", "CARD"] },
                        then: "Maquininha Débito",
                      },
                      {
                        case: { $eq: ["$typePayment", "BRASPAG"] },
                        then: "Pago pelo App",
                      },
                      {
                        case: { $eq: ["$typePayment", "PAGARME"] },
                        then: "Pago pelo App",
                      },
                      {
                        case: { $eq: ["$typePayment", "PIX"] },
                        then: "Pago APP",
                      },
                      {
                        case: { $eq: ["$typePayment", "STRIPE"] },
                        then: "Pago pelo App",
                      },
                      {
                        case: { $eq: ["$typePayment", "CREDIT_COMPANY"] },
                        then: "Pago pelo App",
                      },
                      {
                        case: { $eq: ["$typePayment", "WALLET_STRIPE"] },
                        then: "Saldo e Cartão Bancário",
                      },
                    ],
                    default: "$typePayment",
                  },
                },
                coin: 1,
                currencySymbol: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "passenger",
          let: { id: "$passenger" },
          as: "passenger",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$id"] } },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                person: 1,
                stars: 1,
              },
            },
            {
              $lookup: {
                from: "person",
                let: { id: "$person" },
                as: "person",
                pipeline: [
                  {
                    $match: { $expr: { $eq: ["$_id", "$$id"] } },
                  },
                  {
                    $limit: 1,
                  },
                  {
                    $project: {
                      name: 1,
                      // email: 1,
                      cpf: 1,
                      // phone: 1,
                      image: 1,
                      genre: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $unwind: { path: "$passenger", preserveNullAndEmptyArrays: true } },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    const listPromisse = [];

    if (queue && queue.length > 0) {
      for await (const item of queue) {
        listPromisse.push(
          BookingModel.updateOne(
            { _id: item._id },
            {
              lastQueue: moment().utc(false).toDate(),
            },
          ),
        );
      }

      await Promise.all(listPromisse);
    }

    return reply.send(queue);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/booking/QueueController.js",
      error: err?.message,
      method: "queueBooking",
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
      message: "Não foi possível obter a fila de reserva",
      err: err.message,
    });
  }
};

module.exports = queueBooking;
