const mongoose = require("mongoose");
const referralCodeGenerator = require("referral-code-generator");

const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const PersonModel = require("../../../models/Person/PersonModel");
const IndicationModel = require("../../../models/Mobility/Indication/IndicationModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    // Trata status
    data.status = true;

    if (!data.person || !mongoose.isValidObjectId(data.person)) {
      return res.status(400).send({
        message: "Informe uma pessoa válida",
      });
    }

    const code = referralCodeGenerator.alphaNumeric("uppercase", 7, 1);
    data.referralCode = code;

    const personCurrent = await PassengerModel.findOne({
      person: data.person,
    }).lean();

    if (personCurrent && personCurrent._id) {
      return res.send({
        status: 200,
        message: "Passageiro(a) adicionado(a) com sucesso",
        data: personCurrent,
      });
    }

    const item = await PassengerModel.create(data);

    await PersonModel.updateOne(
      { _id: data.person },
      {
        referralCode: code,
      },
    );

    if (data.code) {
      await createIndication(item, code, 20); // codigo de indicação
    }

    return res.send({
      status: 200,
      message: "Passageiro(a) adicionado(a) com sucesso",
      data: item,
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Mobility/Passenger/CreateController.js',
      error: dadosDoErro?.message,
      method: 'CreateController',
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
      message: "Falha ao criar Passageiro(a)",
      Error: dadosDoErro,
    });
  }
};

// Indicação
const createIndication = async (passenger, code, total = 5) => {
  try {
    const isPassenger = await PassengerModel.findOne({
      referralCode: code,
    })
      .select({
        _id: 1,
      })
      .lean();

    if (!isPassenger || !isPassenger._id) {
      return;
    }

    await IndicationModel.create({
      passenger: passenger._id,
      referralCode: code,
      total: total,
    });
  } catch (err) {
    return null;
  }
};
