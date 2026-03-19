const mongoose = require("mongoose");
const moment = require("moment");

const AcessFlow = require("../../models/AcessFlow");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { timeInterval } = req.query;

    const logs = await AcessFlow.aggregate([
      {
        $match: {
          updatedAt: {
            $gte: new Date(
              moment().add(-Number(timeInterval), "days").startOf().format()
            ),
            $lte: new Date(moment().endOf().format()),
          },
        },
      },
      {
        $count: "count",
      },
    ]);

    return res.status(200).send({
      data: logs[0],
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/AcessFlow/statisticController.js',
    error: dadosDoErro?.message,
    method: 'statisticController',
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
      message: "Falha ao criar Log",
      error: dadosDoErro,
    });
  }
};
