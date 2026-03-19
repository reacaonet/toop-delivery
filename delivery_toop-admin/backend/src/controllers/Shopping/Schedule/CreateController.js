const mongoose = require('mongoose');
const Schedule = require('../../../models/Shopping/ScheduleModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const {
      company
    } = req.params;

    await Schedule.findOneAndUpdate(
      {
        company: mongoose.Types.ObjectId(company),
        dayWeek: data.dayWeek,
        startHour: data.startHour,
        endHour: data.endHour,
        deletedAt: {
          $exists: false,
        }
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );

    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: 'Id da empresa inválido',
      })
    }

    let schedule = await Schedule.create({
      company,
      ...data
    });

    schedule = await schedule.populate('company').execPopulate();

    return res.send({
      status: 200,
      message: "Agendamento criado com sucesso",
      data: schedule
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Schedule/CreateController.js',
    error: err?.message,
    method: 'CreateController',
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
      message: "Falha ao criar agendamento da entrega",
      Error: dadosDoErro
    });
  }



}
