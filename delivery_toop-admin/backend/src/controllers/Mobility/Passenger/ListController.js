const mongoose = require("mongoose");
const referralCodeGenerator = require("referral-code-generator");

const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const PersonModel = require("../../../models/Person/PersonModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const { id } = req.params;

    let { status } = req.query;

    let list = [];
    let filter = {};

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Id inválido" });
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter.deletedAt = {
      $exists: false,
    };

    // list = await PassengerModel.find(filter);

    if (id) {
      list = await PassengerModel.findOne({
        _id: id,
      }).lean();
    } else {
      list = await PassengerModel.find(filter);
    }

    if (list._id && !list.referralCode) {
      const code = referralCodeGenerator.alphaNumeric("uppercase", 7, 1);
      await PassengerModel.updateOne({ _id: id }, { referralCode: code });
      await PersonModel.updateOne({ _id: list.person }, { referralCode: code });
      list.referralCode = code;
    }

    return res.send(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Passenger/ListController.js',
      error: err?.message,
      method: 'ListController',
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

    return res.status(400).send({
      message: "Falha ao encontrar item",
      err: err.message,
    });
  }
};
