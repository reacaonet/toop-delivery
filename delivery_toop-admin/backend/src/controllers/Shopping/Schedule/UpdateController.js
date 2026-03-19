const mongoose = require('mongoose');

const Schedule = require('../../../models/Shopping/ScheduleModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {

    const id = req.params.id;
    const data = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: 'Id do registro inválido',
      })
    }

    const schedule = await Schedule.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: true,
      new: true
    }, (err) => {
      console.log('erro', err);
    });

    res.send({
      status: 200,
      message: "Agendamento da entrega atualizado com sucesso",
      data: schedule
    });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Schedule/UpdateController.js',
      error: dadosDoErro?.message,
      method: 'UpdateController',
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
      message: "Falha ao atualizar Agendamento",
      Error: dadosDoErro
    });
  }
};