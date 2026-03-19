const CompanyHoursModel = require('../../models/Company/CompanyHoursModel');
const LogModel = require("../../models/LogModel");

const hoursCreate = async (req, res) => {
  try {
    const data = req.body;
    const hours = await CompanyHoursModel.create(data)

    return res.send({
      status: 200,
      message: "Horário de atendimento criada com sucesso",
      data: hours
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/HoursCreate.js',
      error: err?.message,
      method: 'hoursCreate',
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

    console.log(err);
    return res.status(400).send({
      message: "Falha ao criar Horário de Atendimento",
      Error: err
    });
  }
}



module.exports = hoursCreate;
