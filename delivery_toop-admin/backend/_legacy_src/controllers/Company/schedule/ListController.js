const scheduleModel = require("../../../models/Shopping/ScheduleModel");
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const company = req.params.company;
    const filter = {};

    if (!company) {
      return res.status(400).send({
        message: "Obrigatório informar uma company",
      });
    }

    filter.company = company;

    filter.deletedAt = {
      $exists: false,
    };

    const scheduleList = await scheduleModel
      .find(filter)
      .populate("company", {
        name: 1,
      })
      .sort({ dayWeek: 1, startHour: 1 });

    return res.json(scheduleList);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/schedule/ListController.js',
    error: err?.message,
    method: 'schedule/ListController',
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
      message: "Falha ao encontrar agendamento",
      Error: dadosDoErro,
    });
  }
};
