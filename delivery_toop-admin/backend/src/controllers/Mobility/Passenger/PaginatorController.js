const mongoose = require("mongoose");

const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const filter = {};

    const { pageIn, pageOut, franchise, person } = req.query;
    const { isRoot, franchise: franchiseAuth } = req;

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchiseAuth);
    }

    if (franchise && mongoose.Types.ObjectId.isValid(franchise)) {
      filter.franchise = franchise;
    }

    if (person && mongoose.Types.ObjectId.isValid(person)) {
      filter.person = person;
    }

    filter.deletedAt = {
      $exists: false,
    };

    let list;

    if ((pageIn, pageOut)) {
      list = await PassengerModel.find(filter)
        .populate("franchise")
        .populate("person")
        .skip(parseInt(pageIn) * parseInt(pageOut))
        .limit(parseInt(pageOut));

      let numTotal = await PassengerModel.find(filter).countDocuments();

      return res.json({ list, total: numTotal });
    } else {
      list = await PassengerModel.find();
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Passenger/PaginatorController.js',
    error: dadosDoErro?.message,
    method: 'PaginatorController',
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


    console.log(dadosDoErro);

    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};
