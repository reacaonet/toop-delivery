const mongoose = require("mongoose");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const passengerHistory = async (request, reply) => {
  try {
    const { passenger } = request.params || {};
    const { pageIn = 1, pageOut = 20 } = request.query;

    const list = await BookingModel.aggregate([
      {
        $match: {
          passenger: new mongoose.Types.ObjectId(passenger),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          price: 1,
          origin: 1,
          destiny: 1,
          payment: 1,
          status: 1,
          statusTxt: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "waiting"] }, then: "Aguardando" },
                { case: { $eq: ["$status", "accepted"] }, then: "Aceito" },
                {
                  case: { $eq: ["$status", "in_progress"] },
                  then: "Em Andamento",
                },
                { case: { $eq: ["$status", "concluded"] }, then: "Finalizado" },
                { case: { $eq: ["$status", "canceled"] }, then: "Cancelado" },
                {
                  case: { $eq: ["$status", "driver_not_found"] },
                  then: "Cancelado",
                },
              ],
              default: "",
            },
          },
          service: 1,
          driver: 1,
          createdAt: 1,
          code: 1,
        },
      },
      {
        $skip: (parseInt(pageIn, 10) - 1) * parseInt(pageOut, 10),
      },
      {
        $limit: parseInt(`${pageOut}`, 10),
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
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "service",
          let: { service: "$service" },
          as: "service",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$service"],
                },
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
          from: "evaluation",
          let: { payment: "$payment" },
          as: "evaluation",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$paymentDriver", "$$payment"],
                },
                typeEvaluator: "passenger",
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $lookup: {
          from: "paymentDriver",
          let: { payment: "$payment" },
          as: "payment",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$payment"],
                },
              },
            },
            {
              $project: {
                typePayment: 1,
                lastDigits: "$payload.card_last_digits",
                card: "$payload.card.brand",
                statusPayload: 1,
                typePaymentTxt: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$typePayment", "MONEY"] },
                        then: "Dinheiro",
                      },
                      {
                        case: { $eq: ["$typePayment", "CARD"] },
                        then: "Debito",
                      },
                      {
                        case: { $eq: ["$typePayment", "BRASPAG"] },
                        then: "Crédito",
                      },
                      {
                        case: { $eq: ["$typePayment", "PAGARME"] },
                        then: "Crédito",
                      },
                      { case: { $eq: ["$typePayment", "PIX"] }, then: "PIX" },
                    ],
                    default: "$typePayment",
                  },
                },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$driver", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$evaluation", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
    ]);

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/booking/PassengerHistoryController.js',
      error: err?.message,
      method: 'passengerHistory',
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

    console.log("faill", err);

    return reply.status(400).send({
      message: "Não conseguimos listar o histórico",
      err: err.message,
    });
  }
};

module.exports = passengerHistory;
