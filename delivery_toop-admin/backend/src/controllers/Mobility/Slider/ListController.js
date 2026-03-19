const mongoose = require("mongoose");
const Slider = require("../../../models/Mobility/Slider/sliderModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { franchise, latitude, longitude, type } = req.query;

    const filter = {};

    filter.deletedAt = {
      $exists: false,
    };

    filter.status = true;

    if (franchise && mongoose.Types.ObjectId.isValid(franchise)) {
      filter.franchise = mongoose.Types.ObjectId(franchise);
    }

    if (type) {
      filter.target = type;
    }

    const list = await Slider.find(filter).lean();

    return res.json(list);
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/Slider/ListController.js",
      error: err?.message,
      method: "ListController",
      type: "error",
      level: 0,
      origin: "backend",
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

    return res.status(400).send({
      mesage: "Falha ao encontrar Slider",
      error: err.message,
    });
  }
};
