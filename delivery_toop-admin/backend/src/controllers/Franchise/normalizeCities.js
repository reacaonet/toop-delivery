const mongoose = require("mongoose");

const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const DeliveryManModel = require("../../models/DeliveryMan/DeliveryManModel");

const CityModel = require("../../models/Setting/CityModel");
const StateModel = require("../../models/Setting/StateModel");
const LogModel = require("../../models/LogModel");

const { getCoordinate } = require("../../utils");

/**
 * Url - /franchises/normalize-cities
 */
const normalizeCities = async (req, res) => {
  try {
    const franchises = await FranchiseModel.find({
      deletedAt: { $exists: false },
    }).lean();

    for await (const franchise of franchises) {
      let city = "";
      let state = "";

      console.log("Franchise _id: ", franchise._id);
      console.log("Franchise city: ", franchise.city);
      console.log("Franchise state: ", franchise.state);

      if (!mongoose.isValidObjectId(franchise.city)) {
        const res = await CityModel.findOne({ name: franchise.city });
        if (res) {
          console.log("Cidade: ", res.name);
          city = res._id;
        } else console.log("Cidade: ", "Não localizado");
      }

      if (!mongoose.isValidObjectId(franchise.state)) {
        const res = await StateModel.findOne({ name: franchise.state });
        if (res) {
          console.log("State: ", res.name);
          state = res._id;
        } else console.log("State: ", "Não localizado");
      }

      console.log("+++++++++++++++++++++++++++++++++++++++++");

      if (city) {
        await FranchiseModel.updateOne({ _id: franchise._id }, { city });
      }
      if (state) {
        await FranchiseModel.updateOne({ _id: franchise._id }, { state });
      }

      // await FranchiseModel.updateOne(
      //   { _id: franchise._id },
      //   {
      //     city,
      //     state,
      //   },
      // );
    }

    return res.status(200).send({
      message: "sucesso",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Franchise/normalizeCities.js',
      error: err?.message,
      method: 'normalizeCities',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    console.log("err", err);
    return res.status(400).send({
      message: "Não foi possível normalizar",
    });
  }
};

module.exports = normalizeCities;
