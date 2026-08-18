const scheduleModel = require('../../../models/Shopping/ScheduleModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    // const data = req.body;
    // console.log('data', data);
    const { company } = req.params;
    const { dayWeek, hours, type } = req.body;

    if (!company) {
      return res.status(400).send({
        message: "Obrigatório informar uma company"
      });
    }

    if (dayWeek && Array.isArray(dayWeek)) {
      for await (const day of dayWeek) {
        const payload = {
          company,
          type: type || 'BOTH',
          dayWeek: day,
        };

        for await (const hour of hours) {
          payload.startHour = Number(hour.startHour);
          payload.endHour = Number(hour.endHour);

          console.log();

          const newHour = await scheduleModel.create(payload)
          .catch(e => {
            console.log('erroo', e);
            return res.status(400).send({
              message: "Falha ao criar Agendamento 1",
              Error: e
            });
          });

          if (!newHour) {
            console.log('payload', payload);
            return res.status(400).send({
              message: "Falha ao criar Agendamento 2",
              Error: payload
            });
          }
        }
      }
    }

    return res.send({
      status: 200,
      message: "Agendamento criado com sucesso",
      data: []
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Company/schedule/CreateController.js',
    error: dadosDoErro?.message,
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


    console.log('Erro 4', dadosDoErro);
    return res.status(400).send({
      message: "Falha ao criar Agendamento 3",
      Error: dadosDoErro
    });
  }
};
