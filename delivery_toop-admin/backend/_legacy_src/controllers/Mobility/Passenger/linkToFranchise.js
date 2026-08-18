/** Model */
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const PersonModel = require("../../../models/Person/PersonModel");
const LogModel = require("../../../models/LogModel");
const { removeUserFromTopic } = require("../Topic/LinkController");

const linkToFranchise = async (request, reply) => {
  try {
    const { passenger, person, latitude, longitude, token } = request.body || {};

    if (!latitude || !longitude || latitude === "0" || longitude === "0") {
      return reply.status(400).send({
        message: "Informe uma coordenada válida",
      });
    }

    const franchise = await FranchiseModel.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
        },
      },
      deletedAt: {
        $exists: false,
      },
    }).select({
      _id: 1,
    });

    const passengerData = await PassengerModel.findById(passenger)
      .select({
        token: 1,
        franchise: 1,
      })
      .lean();

    if (franchise && franchise._id) {
      if (passenger) {
        await PassengerModel.updateOne(
          { _id: passenger },
          {
            franchise: `${franchise._id}`.toString(),
          },
        );
      }

      if (person) {
        await PersonModel.updateOne(
          { _id: person },
          {
            franchise: `${franchise._id}`.toString(),
          },
        );
      }

      if (franchise._id?.toString() != passengerData?.franchise?.toString()) {
        await removeUserFromTopic(passengerData, "passenger", PassengerModel, null);
      }
    }

    return reply.send(franchise);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/Passenger/linkToFranchise.js",
      error: err?.message,
      method: "linkToFranchise",
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
      message: "Falha ao vincular passageiro em uma franquia",
      err: err.message,
    });
  }
};

module.exports = linkToFranchise;
