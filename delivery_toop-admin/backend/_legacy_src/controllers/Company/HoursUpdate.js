const CompanyHoursModel = require("../../models/Company/CompanyHoursModel");
const LogModel = require("../../models/LogModel");

const hoursUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const hours = await CompanyHoursModel.findByIdAndUpdate(id, data);

    return res.send({
      status: 200,
      message: "Horários de atendimento atualizado com sucesso",
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Company/HoursUpdate.js',
    error: err?.message,
    method: 'hoursUpdate',
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
      message: "Falha ao atualizar os horários de atendimento",
      Error: err,
    });
  }
};

module.exports = hoursUpdate;
