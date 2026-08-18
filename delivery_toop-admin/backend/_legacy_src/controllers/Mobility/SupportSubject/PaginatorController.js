const mongoose = require("mongoose");

const SupportSubjectModel = require("../../../models/Mobility/SupportSubject/SupportSubjectModel");
const LogModel = require("../../../models/LogModel"); 

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, type, target, subject, status, franchiseId } = req.query;
    const { isRoot, franchise } = req;

    let filter = {};
    let list;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchise);
    }

    if (franchiseId) {
      filter.franchise = new mongoose.Types.ObjectId(franchiseId);
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

    // --> not deleted
    filter.deletedAt = {
      $exists: false,
    };

    list = await SupportSubjectModel.aggregate([
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
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $skip: parseInt(pageIn, 10) * parseInt(pageOut, 10) },
      { $limit: parseInt(pageOut, 10) },
    ]);

    const numTotal = await SupportSubjectModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/SupportSubject/PaginatorController.js',
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
