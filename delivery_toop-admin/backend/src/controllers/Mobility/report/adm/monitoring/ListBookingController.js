const mongoose = require("mongoose");
/** Model */
const BookingModel = require("../../../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../../../models/LogModel");

const mapListBooking = async (request, reply) => {
  try {
    const { isRoot, franchise: loggedFranchise } = request;
    const { franchise, pageIn = 1, pageOut = 10 } = request.query;
    const filter = {};

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(loggedFranchise);
    }

    if (franchise) {
      filter.franchise = new mongoose.Types.ObjectId(franchise);
    }

    filter.status = {
      $in: ["waiting", "accepted", "in_progress", "scheduled"],
    };

    const list = await BookingModel.aggregate([
      {
        $match: filter,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          passenger: 1,
          driver: 1,
          origin: 1,
          destiny: 1,
          additionalStops: 1,
          price: 1,
          priceOfferDriver: 1,
          service: 1,
          distance: 1,
          routeTime: 1,
          createdAt: 1,
          status: 1,
          payment: 1,
          directPayment: 1,
          statusTxt: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$status", "waiting"] },
                  then: "Aguardando",
                },
                {
                  case: { $eq: ["$status", "accepted"] },
                  then: "Aceito",
                },
                {
                  case: { $eq: ["$status", "in_progress"] },
                  then: "Em Andamento",
                },
              ],
              default: "",
            },
          },
          startRaceAt: 1,
          tag: 1,
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
                      email: 1,
                      ddi: 1,
                      phone: 1,
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
                ddi: 1,
                phone: 1,
                email: 1,
                selfiePhoto: 1,
                location: 1,
                status: 1,
                activeRunStatus: 1,
                updatedAt: 1,
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
                currencySymbol: 1,
                typePayment: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: "$passenger", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$driver", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
    ]);

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/report/adm/monitoring/ListBookingController.js",
      error: err?.message,
      method: "mapListBooking",
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
      message: "Falha ao listar ",
      err: err.message,
    });
  }
};

module.exports = mapListBooking;
