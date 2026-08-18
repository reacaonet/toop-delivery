const CompanyHoursModel = require("../../models/Company/CompanyHoursModel");
const LogModel = require("../../models/LogModel");

const hoursShow = async (req, res) => {
  try {
    const { company, companies = [] } = req;
    //const { idCompany } = req.params;

    //console.log(idCompany);
    const hours = await CompanyHoursModel.find({
      company: { $in: companies.length > 0 ? companies : [company] },
    })
      .populate("company")
      .sort({ dayWeek: 1, startHour: 1 });

    return res.send({
      status: 200,
      data: hours,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Company/HoursShow.js',
      error: err?.message,
      method: 'hoursShow',
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
      message: "Falha ao listar os horários de atendimento",
      Error: err,
    });
  }
};

module.exports = hoursShow;
