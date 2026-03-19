const mongoose = require("mongoose");
const moment = require("moment");
const AcessFlow = require("../../models/AcessFlow");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    let filter = {};
    const data = req.body;
    const today = moment().startOf("day");
    const createdAt = {
      $gte: today.toDate(),
      $lte: moment(today).endOf("day").toDate(),
    };

    if (data.device) {
      filter.device = data.device;
      filter.createdAt = createdAt;
    }

    if (data.customer) {
      filter.customer = data.customer;
      filter.createdAt = createdAt;
    }

    if (data.person) {
      filter.person = data.person;
      filter.createdAt = createdAt;
    }

    const findLog = await AcessFlow.findOne(filter).lean();

    if (findLog) {
      await AcessFlow.updateOne({ _id: findLog._id }, data);
      const updateLog = await AcessFlow.findById(findLog._id).lean();

      return res.send({
        status: 200,
        message: "Log atualizado com sucesso",
        data: updateLog,
      });
    }

    const log = await AcessFlow.create(data);

    return res.send({
      status: 200,
      message: "Log criado com sucesso",
      data: log,
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/AcessFlow/CreateController.js',
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
      message: "Falha ao criar Log",
      error: err.message,
    });
  }
};
