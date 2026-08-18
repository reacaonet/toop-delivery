const moment = require("moment");
const mongoose = require("mongoose");
const Avaliation = require("../../models/AvaliationModel");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const result = await Avaliation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(moment().add(-180, "days").startOf().format()),
            $lte: new Date(moment().endOf().format()),
          },
        },
      },
      {
        $group: {
          _id: "$company",
          totalRating: { $sum: "$starts" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          totalRating: 1,
          count: 1,
          mediaRating: { $divide: ["$totalRating", "$count"] },
        },
      },
    ]);

    const totalCount = await Avaliation.aggregate([
      {
        $group: {
          _id: "$company",
          allRating: { $sum: "$starts" },
        },
      },
    ]);

    const companies = result.map((company) => {
      const allRating = totalCount.find((item) => {
        const id1 = mongoose.Types.ObjectId(item._id);
        const id2 = mongoose.Types.ObjectId(company._id);
        if (id1.equals(id2)) {
          return item.allRating;
        }
      });
      return { company, allRating: allRating.allRating };
    });

    return res.json({ companies });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Avaliation/ListAvaliationMediaController.js',
    error: dadosDoErro?.message,
    method: 'ListAvaliationMediaController',
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
      message: "Falha ao encontrar avaliações",
      Error: dadosDoErro,
    });
  }
};
