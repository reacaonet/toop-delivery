const mongoose = require("mongoose");

const PeakHourModel = require("../../../models/Mobility/PeakHour/PeakHourModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data.status = true;

    if (data.franchise && data.franchise._id) {
      data.franchise = data.franchise._id;
    }

    //Quando o ID é obrigatório
    if (!data.franchise || !mongoose.Types.ObjectId.isValid(data.franchise)) {
      return res.status(400).send({
        message: "Id da Franquia é inválido!",
      });
    }

    const item = await PeakHourModel.create(data);

    return res.send({
      status: 200,
      message: "Registro criado com sucesso",
      data: item,
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Mobility/PeakHour/CreateController.js',
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
      message: "Falha ao criar Regisstro",
      err: err.message,
    });
  }
};
