const mongoose = require('mongoose');

const Schedule = require('../../../models/Shopping/ScheduleModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: 'Id do registro inválido',
      })
    }

    await Schedule.findByIdAndUpdate(
      id,
      {
        $set: {
          deletedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "Agendamento excluído com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Schedule/DeleteController.js',
    error: err?.message,
    method: 'DeleteController',
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
      messsage: "Falha ao excluir agendamento",
      Error: dadosDoErro
    });
  }
};
