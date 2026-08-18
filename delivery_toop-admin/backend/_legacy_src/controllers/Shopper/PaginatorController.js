const mongoose = require("mongoose");

const Shopper = require("../../models/ShopperModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const filter = {};

    const { pageIn, pageOut, person, isOnline } = req.query;
    const { company, companies = [] } = req;

    filter.deletedAt = {
      $exists: false,
    };

    // restringe os dados a nivel da franquia
    filter.company = { $in: companies.length > 0 ? companies : [company] };

    let isOnlineValid = isOnline ? `${isOnline}` : undefined;
    if (isOnlineValid === "false" || isOnlineValid === "true") {
      filter.isOnline = JSON.parse(`${isOnlineValid}`);
    }

    if (person && mongoose.Types.ObjectId.isValid(person)) {
      filter.person = person;
    }

    let list;

    if ((pageIn, pageOut)) {
      list = await Shopper.find(filter)
        .populate("company")
        .populate("person")
        .limit(parseInt(pageOut))
        .skip(parseInt(pageIn) * parseInt(pageOut));
      let numTotal = await Shopper.find().countDocuments();
      return res.json({ list, total: numTotal });
    } else {
      list = await Shopper.find();
    }

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopper/PaginatorController.js',
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


    return res.status(400).send({
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};
