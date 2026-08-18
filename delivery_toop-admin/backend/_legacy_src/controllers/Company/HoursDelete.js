const CompanyHoursModel = require('../../models/Company/CompanyHoursModel');
const LogModel = require("../../models/LogModel");

const hoursDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const hours = await CompanyHoursModel.findByIdAndRemove(id)

    return res.send({
      status: 200,
      message: "Horários de atendimento excluido com sucesso",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/HoursDelete.js',
      error: err?.message,
      method: 'hoursDelete',
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
      message: "Falha ao excluir os horários de atendimento",
      Error: err
    });
  }
}

module.exports = hoursDelete;
