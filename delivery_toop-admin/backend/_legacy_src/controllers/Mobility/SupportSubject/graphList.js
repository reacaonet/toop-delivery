const moment = require('moment');

const SupportSubjectModel = require('../../../models/Mobility/SupportSubject/SupportSubjectModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    let timezone = 'America/Sao_Paulo';

    const list = await SupportSubjectModel.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: {
                date: '$createdAt',
                timezone: timezone,
              },
            },
            day: {
              $dayOfMonth: {
                date: '$createdAt',
                timezone: timezone,
              },
            },
            year: {
              $year: {
                date: '$createdAt',
                timezone: timezone,
              },
            },
          },
          enable: {
            $sum: {
              $cond: ['$status', 1, 0],
            },
          },
          disabled: {
            $sum: {
              $cond: ['$status', 0, 1],
            },
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]).limit(14);

    const total = await SupportSubjectModel.aggregate([
      {
        $group: {
          _id: 'id',
          enable: {
            $sum: {
              $cond: ['$status', 1, 0],
            },
          },
          disabled: {
            $sum: {
              $cond: ['$status', 0, 1],
            },
          },
          total: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    const newList = [];
    let setEnable = total[0].enable;
    let setDisabled = total[0].disabled;
    let setTotal = total[0].total;

    list.forEach((graph, i) => {
      if (i === 0) {
        newList.push({
          _id: {
            month: graph._id.month,
            day: graph._id.day,
            year: graph._id.year,
          },
          enable: setEnable,
          disabled: setDisabled,
          total: setTotal,
        });
      } else {
        setEnable = setEnable - graph.enable;
        setDisabled = setDisabled - graph.disabled;
        setTotal = setTotal - graph.total;

        newList.push({
          _id: {
            month: graph._id.month,
            day: graph._id.day,
            year: graph._id.year,
          },
          enable: setEnable,
          disabled: setDisabled,
          total: setTotal,
        });
      }
    });

    return res.json(newList);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/SupportSubject/graphList.js',
    error: dadosDoErro?.message,
    method: 'graphList',
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
      message: 'Falha ao lista todos os Assuntos/motivos',
      Error: dadosDoErro.message,
    });
  }
};
