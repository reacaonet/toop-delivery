const mongoose = require("mongoose");

/** Model */
const ScheduleModel = require("../../../models/Shopping/ScheduleModel");
const LogModel = require("../../../models/LogModel");

const haveSchedule = async (req, res) => {
  try {
    const { company } = req.params;

    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).send({
        message: "Id da empresa inválido",
      });
    }

    const isHave = await ScheduleModel.findOne({
      company,
      deletedAt: { $exists: false },
    }).lean();

    return res.status(200).send({
      isSchedule: isHave ? true : false,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Schedule/HaveSchedule.js',
      error: err?.message,
      method: 'haveSchedule',
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
      message: "Não foi possível verificar",
      err: err.message,
    });
  }
};

module.exports = haveSchedule;
