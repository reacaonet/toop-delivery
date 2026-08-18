const mongoose = require("mongoose");
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");

const list = async (request, reply) => {
  try {
    const { franchise } = request.params;

    const settings = await FranchiseModel.findOne({
      _id: franchise,
    })
      .select({
        serviceDefault: 1,
        languageDefault: 1,
        coin: 1,
        emergencyPhone: 1,
      })
      .lean();

    if (settings && settings._id) {
      delete settings._id;
    }

    return reply.send(settings);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Setting/App/list.js',
      error: err?.message,
      method: 'list',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: request?.application,
        franchise: request?.franchise,
        company: request?.company,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    return reply.status(400).send({
      mesage: "não foi possível retornar configurações",
      err: err.message,
    });
  }
};

module.exports = list;
