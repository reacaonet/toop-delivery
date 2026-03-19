const mongoose = require("mongoose");
const moment = require("moment");
require("moment/locale/en-nz");

const Schedule = require("../../../models/Shopping/ScheduleModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { company } = req.params;
    const { type } = req.query;

    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Id da empresa inválido",
      });
    }

    let filter = {};

    filter.company = company;
    filter.deletedAt = {
      $exists: false,
    };

    if (type) {
      filter.type = { $in: ["BOTH", `${type}`] };
    }

    // Lista de horários por estabelecimento
    const list = await Schedule.find(filter).sort({ dayWeek: 1, startHour: 1 });

    // Data atual
    const dt = moment().utc().subtract(3, "hours");

    const dayAtual = dt.locale("en-nz").format("dddd").toString().toUpperCase();
    const hourAtual = dt.format("HHmm");

    let daysToRetorn = {};

    list.map(day => {
      if (!daysToRetorn[day.dayWeek]) {
        daysToRetorn[day.dayWeek] = [];
      }

      if (day.dayWeek === dayAtual && day.startHour >= hourAtual) {
        if (!daysToRetorn["TODAY"]) {
          daysToRetorn["TODAY"] = [];
        }

        daysToRetorn["TODAY"].push({
          id: day._id,
          start: day.startHour,
          end: day.endHour,
        });
      }

      daysToRetorn[day.dayWeek].push({
        id: day._id,
        start: day.startHour,
        end: day.endHour,
      });
    });

    return res.json(daysToRetorn);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Schedule/ListController.js',
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
      message: "Falha ao listar agendamento da entrega",
      Error: dadosDoErro,
    });
  }
};
