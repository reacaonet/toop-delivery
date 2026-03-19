const mongoose = require("mongoose");
const Person = require("../../../models/Person/PersonModel");
const LogModel = require("../../../models/LogModel");

const filterPassenger = async (request, reply) => {
  try {
    const { isRoot, franchise } = request;
    const { name = "" } = request.query || {};
    const filter = {};
    const filterPassenger = {};

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchise);
    }

    if (name && typeof name === "string") {
      filter["$or"] = [
        {
          name: { $regex: ".*" + `${name.toLowerCase()}` + ".*", $options: "i" },
        },
        {
          email: { $regex: ".*" + `${name.toLowerCase()}` + ".*", $options: "i" },
        },
      ];
    }

    filterPassenger["passenger._id"] = {
      $exists: true,
    };

    console.log("filter", JSON.stringify(filter));

    const list = await Person.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "passenger",
          let: { person: "$_id" },
          as: "passenger",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$person", "$$person"] },
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$passenger", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "franchise",
          let: { franchise: "$franchise" },
          as: "franchise",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$franchise"] },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          devices: 0,
          topics: 0,
        },
      },
      {
        $match: filterPassenger,
      },
      {
        $limit: 10,
      },
    ]);

    return reply.send(list);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/Passenger/FilterPassenger.js",
      error: err?.message,
      method: "filterPassenger",
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
      message: "Não conseguimos listar passageiro",
      err: err.message,
    });
  }
};

module.exports = filterPassenger;
