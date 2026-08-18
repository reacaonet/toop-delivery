const mongoose = require("mongoose");

const NotificationModel = require("../../../models/Mobility/Notification/NotificationModel");
const LogModel = require("../../../models/LogModel")

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, type, franchise } = req.query;
    const { isRoot, franchise: franchiseAuth } = req;

    let filter = {};
    let list;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchiseAuth);
    }

    // --> franchise filter
    if (franchise) {
      filter.franchise = mongoose.Types.ObjectId(franchise);
    }

    // --> name filter
    if (type) {
      filter.type = type;
    }

    // --> not deleted
    filter.deletedAt = {
      $exists: false,
    };

    list = await NotificationModel.aggregate([
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
    let numTotal = await NotificationModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/Notification/PaginatorController.js',
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
