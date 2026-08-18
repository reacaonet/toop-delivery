const mongoose = require("mongoose");

const CityModel = require("../../../models/Setting/CityModel");
const CityBR = require("../../../models/Address/CityModel");
const LogModel = require("../../../models/LogModel");

/**
 * Url - /setting/city/normalize-cities
 */
const normalizeCities = async (req, res) => {
  try {
    const cities = await CityModel.find({
      deletedAt: { $exists: false },
    }).lean();

    for await (const city of cities) {
      let lat = "";
      let lng = "";

      console.log("City _id: ", city._id);
      console.log("City name: ", city.name);

      if (!city.latitude) {
        const res = await CityBR.findOne({ nome: { $regex: ".*" + city.name.trim().toLowerCase() + ".*", $options: "i" } });
        if (res) {
          console.log("Lat Nome: ", res.nome);
          console.log("Lat: ", res.latitude);
          lat = res.latitude;
        } else console.log("Lat: ", "Não localizado");
      }

      if (!city.longitude) {
        const res = await CityBR.findOne({ nome: { $regex: ".*" + city.name.trim().toLowerCase() + ".*", $options: "i" } });
        if (res) {
          console.log("Lng Nome: ", res.nome);
          console.log("Lng: ", res.longitude);
          lng = res.longitude;
        } else console.log("Lng: ", "Não localizado");
      }

      console.log("+++++++++++++++++++++++++++++++++++++++++");

      if (lat) {
        await CityModel.updateOne({ _id: city._id }, { latitude: lat });
      }
      if (lng) {
        await CityModel.updateOne({ _id: city._id }, { longitude: lng });
      }
    }

    return res.status(200).send({
      message: "sucesso",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Setting/City/normalizeCities.js',
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
