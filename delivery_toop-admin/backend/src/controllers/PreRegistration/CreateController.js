const moment = require("moment");

const PreRegistration = require("../../models/PreRegistration/PreRegistrationModel");
const LogModel = require("../../models/LogModel");

const createController = async (request, reply) => {
  try {
    const { phone, ddi = null } = request.body;

    const filter = {
      phone,
    };

    if (ddi) {
      filter.ddi = ddi;
    }

    const existRegister = await PreRegistration.findOne(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    if (existRegister && existRegister._id) {
      if (existRegister.status === "DECLINED") {
        await PreRegistration.replaceOne(
          { _id: existRegister._id },
          {
            createdAt: moment().utc(false).toDate(),
            ddi: existRegister.ddi ?? "+55",
            phone: existRegister.phone,
            status: "RESENT",
            terms: false,
          },
        );

        return reply.send({
          status: 200,
          message: "registro recusado, liberado para um novo cadastro",
          data: {
            _id: existRegister._id,
            phone: existRegister.phone,
            status: "RESENT",
            terms: false,
          },
        });
      }

      return reply.send({
        status: 200,
        message: "Cadastro já existe",
        data: existRegister,
      });
    }

    // create in db
    const newPreRegistration = new PreRegistration({
      ddi: ddi ?? "+55",
      phone,
    });

    const preRegistration = await newPreRegistration.save();

    return reply.send({
      status: 200,
      message: "Informação salva",
      data: preRegistration,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/PreRegistration/CreateController.js',
      error: err?.message,
      method: 'createController',
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

    console.log("Error Geral", err);

    return reply.status(400).send({
      message: "Falha ao salvar informação",
      err: err.message,
    });
  }
};

module.exports = createController;
