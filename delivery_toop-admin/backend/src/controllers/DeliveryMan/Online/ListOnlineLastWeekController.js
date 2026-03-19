const moment = require("moment");
const mongoose = require("mongoose");
const momentDurationFormatSetup = require("moment-duration-format");
const DeliveryManOnline = require('../../../models/DeliveryMan/DeliveryManOnlineModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const deliveryMan = req.params.deliveryMan;
    const { pageIn, pageOut } = req.query;

    if (deliveryMan && !mongoose.Types.ObjectId.isValid(deliveryMan)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    }

    let list = await DeliveryManOnline.find({
      deliveryMan: mongoose.Types.ObjectId(deliveryMan),
      online: {
        $gte: new Date(moment().add(-7, "days").startOf().format('YYYY-MM-DD')),
        $lte: new Date(moment().endOf().format())
      }
    }).limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));

    let totalMedia = await DeliveryManOnline.aggregate([
      {
        $match: {
          deliveryMan: mongoose.Types.ObjectId(deliveryMan),
          online: {
            $gte: new Date(moment().add(-7, "days").startOf().format('YYYY-MM-DD')),
            $lte: new Date(moment().endOf().format())
          },
          total: { $gt: 0 }
        },
      },
      {
        $group: {
          _id: "$deliveryMan",
          totalTime: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          totalTime: 1,
          count: 1,
          mediaTime: { $divide: ["$totalTime", 7] },
        },
      }
    ]);

    momentDurationFormatSetup(moment);

    if (totalMedia && totalMedia.length > 0) {
      totalMedia[0].mediaTime = moment.duration(totalMedia[0].mediaTime, "minutes").format("h [hrs], m [min]");
    }

    if (list && list.length > 0) {
      list = list.map(item => {
        const totalFormated = moment.duration(item.total, "minutes").format("h [hrs], m [min]");
        return {
          _id: item._id,
          deliveryMan: item.deliveryMan,
          online: item.online,
          offline: item.offline,
          total: totalFormated
        };
      })
    }

    return res.json({ list, totalMedia })
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/DeliveryMan/Online/ListOnlineLastWeekController.js',
    error: dadosDoErro?.message,
    method: 'ListOnlineLastWeekController',
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
      mesage: "Falha ao listar últimas datas do entregador online",
      error: dadosDoErro
    });
  }
};
