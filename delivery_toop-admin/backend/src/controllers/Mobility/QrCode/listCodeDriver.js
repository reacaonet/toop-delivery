const moment = require("moment");

/** Model */
const QrCodeDriverModel = require("../../../models/Mobility/Driver/QrCodeDriverModel");
const LogModel = require("../../../models/LogModel");

const listCodeDriver = async (request, reply) => {
  try {
    const { code } = request.query;

    if (!code || `${code}`.length < 6) {
      return reply.status(400).send({
        message: "Informe um código com pelo menos 6 caracteres",
      });
    }

    const date = moment().subtract(1, "hours").toDate();

    const resp = await QrCodeDriverModel.findOne({
      code: code,
      createdAt: {
        $gte: date,
      },
    })
      .populate({
        path: "driver",
        select: {
          _id: 1,
          name: 1,
          activeRunStatus: 1,
        },
      })
      .lean();

    if (!resp || !resp._id) {
      return reply.status(400).send({
        message: "Código informado não existe ou expirado",
      });
    }

    if (!resp.driver || !resp.driver._id) {
      return reply.status(400).send({
        message: "Motorista não localizado",
      });
    }

    return reply.send(resp);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/QrCode/listCodeDriver.js',
      error: err?.message,
      method: 'listCodeDriver',
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

    console.log("err", err);

    return reply.status(400).send({
      message: "Não foi possível identificar código",
      err: err.message,
    });
  }
};

module.exports = listCodeDriver;
