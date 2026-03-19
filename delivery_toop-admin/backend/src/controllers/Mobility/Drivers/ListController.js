const mongoose = require("mongoose");

const DriversModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const id = req.params.id;

    let { activeRunStatus } = req.query;

    let list = [];
    let filter = {};
    if (franchises.length || franchise) {
      filter = {
        _id: {
          $in: franchise ? [franchise] : franchises,
        },
      };
    }

    if (services.length || service) {
      filter = {
        _id: {
          $in: service ? [service] : services,
        },
      };
    }

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Id inválido" });
    }
    if (type) {
      filter.type = {
        $eq: type,
      };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await DriversModel.find(filter).populate("franchise", { name: 1 });

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Drivers/ListController.js',
    error: dadosDoErro?.message,
    method: 'Drivers/ListController',
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
      message: "Falha ao encontrar Motorista",
      Error: dadosDoErro.message,
    });
  }
};
