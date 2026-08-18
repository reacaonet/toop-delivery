const mongoose = require("mongoose");

const PeakHourModel = require("../../../models/Mobility/PeakHour/PeakHourModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;

    let { franchise, start, end, status } = req.query;

    let list = [];
    let filter = {};

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Id inválido" });
    }

    if (start) filter.name = start;
    if (end) filter.name = end;
    if (franchise) filter.franchise = franchise;

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await PeakHourModel.find(filter);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/PeakHour/ListController.js',
    error: dadosDoErro?.message,
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
      message: "Falha ao encontrar registro",
      Error: dadosDoErro.message,
    });
  }
};
