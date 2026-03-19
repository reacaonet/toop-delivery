const mongoose = require("mongoose");

const PeakHourModel = require("../../../models/Mobility/PeakHour/PeakHourModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, franchise, start, end, status } = req.query;
    const { isRoot, franchise: franchiseAuth } = req;

    let filter = {};
    let list;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchiseAuth);
    }

    if (start) filter.name = start;
    if (end) filter.name = end;
    if (franchise) filter.franchise = franchise;

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    // --> not deleted
    filter.deletedAt = { $exists: false };

    list = await PeakHourModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "franchise",
          localField: "franchise",
          foreignField: "_id",
          as: "franchise",
        },
      },
      {
        $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true },
      },
      { $skip: parseInt(pageIn) * parseInt(pageOut) },
      { $limit: parseInt(pageOut) },
    ]);
    let numTotal = await PeakHourModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/PeakHour/PaginatorController.js',
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
      message: "Falha ao encontrar registros para Paginação",
      Error: dadosDoErro,
    });
  }
};
