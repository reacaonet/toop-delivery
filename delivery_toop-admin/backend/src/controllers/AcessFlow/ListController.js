const mongoose = require("mongoose");
const moment = require("moment");

const AcessFlow = require("../../models/AcessFlow");
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const { isRoot, franchise, franchises = [] } = req;
    const timezone = "America/Sao_Paulo";
    const filter = {};

    if (!isRoot || isRoot !== true) {
      filter.franchise = {
        $in: franchises ? franchises : [franchise],
      };
    }

    const logs = await AcessFlow.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            month: {
              $month: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
            day: {
              $dayOfMonth: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
            year: {
              $year: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
          },
          accessInfo: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]).limit(30);

    return res.status(200).send({
      data: logs,
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/AcessFlow/ListController.js',
    error: err?.message,
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
      message: "Falha ao criar Log",
      err: err.message,
    });
  }
};
