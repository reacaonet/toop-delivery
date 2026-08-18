const scheduleModel = require('../../../models/Shopping/ScheduleModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
      const id = req.params.id

      await scheduleModel.findByIdAndUpdate(
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
          message: "Agendamento deletado com sucesso"
      });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/schedule/DeleteController.js',
    error: dadosDoErro?.message,
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
          messsage: "Falha ao deletar agendamento",
          Error: dadosDoErro
      });
  }
};
