const mongoose = require("mongoose");

const SupportSubjectModel = require("../../../models/Mobility/SupportSubject/SupportSubjectModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    // Opcional, retorna registro único
    const { id } = req.params;

    const { subject, type, target, franchise, status } = req.query;

    let list = [];
    let filter = {};

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Id inválido" });
    }

    if (franchise) {
      filter.franchise = franchise;
    }

    // --> subject filter
    if (subject) {
      const decodeSubject = decodeURIComponent(subject);
      filter.subject = {
        $regex: ".*" + decodeSubject.toLowerCase() + ".*",
        $options: "i",
      };
    }

    // --> type filter
    if (type) {
      const decodeType = decodeURIComponent(type);
      filter.type = {
        $regex: ".*" + decodeType.toLowerCase() + ".*",
        $options: "i",
      };
    }

    // --> target filter
    if (target) {
      const decodeTarget = decodeURIComponent(target);
      filter.target = {
        $regex: ".*" + decodeTarget.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    filter.deletedAt = {
      $exists: false,
    };

    list = await SupportSubjectModel.find(filter);

    return res.json(list);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/SupportSubject/ListController.js',
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
      message: "Falha ao encontrar Assunto/motivo",
      Error: dadosDoErro.message,
    });
  }
};
