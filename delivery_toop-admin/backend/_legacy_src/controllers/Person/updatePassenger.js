const validator = require("validator");

/** Model */
const PersonModel = require("../../models/Person/PersonModel");
const PassengerModel = require("../../models/Mobility/Passenger/PassengerModel");
const IndicationModel = require("../../models/Mobility/Indication/IndicationModel");
const LogModel = require("../../models/LogModel");

const updatePassenger = async (request, reply) => {
  try {
    const { personId } = request.params;
    const { name, email, phone, image, cpf, genre, referralCode } = request.body || {};

    const payload = {};

    if (name && name.length < 10) {
      return reply.status(400).send({
        message: "Informe um nome com pelo menos 10 caracteres",
      });
    }

    if (email && !validator.isEmail(email)) {
      return reply.status(400).send({
        message: "Informe um e-mail válido",
      });
    }

    if (email) {
      const emailResp = await existEmail(personId, email);

      if (emailResp) {
        return reply.status(400).send({
          message: "Email já se encontra cadastrado",
        });
      }
    }

    if (phone && !validator.isMobilePhone(`${phone}`, "pt-BR")) {
      return reply.status(400).send({
        message: "Informe um telefone válido",
      });
    }

    if (name) {
      payload.name = name;
    }

    if (email) {
      payload.email = email;
    }

    if (phone) {
      payload.phone = phone;
    }

    if (image) {
      payload.image = image;
    }

    if (cpf) {
      payload.cpf = cpf;
    }

    if (genre && (genre === "H" || genre === "M")) {
      payload.genre = genre;
    }

    if (referralCode) {
      const isCode = await PassengerModel.findOne({
        referralCode: referralCode,
      })
        .select({ _id: 1 })
        .lean();

      if (!isCode) {
        return reply.status(400).send({
          message: "Código informado inválido",
        });
      }

      const passenger = await PassengerModel.findOne({
        person: personId,
      }).select({ _id: 1 });

      IndicationModel.create({
        passenger: passenger._id,
        passengerReceive: isCode._id,
        referralCode: referralCode,
        total: 20,
      });

      return reply.send({});
    }

    if (Object.keys(payload).length <= 0) {
      return reply.status(400).send({
        message: "por favor informe as informações",
      });
    }

    await PersonModel.updateOne({ _id: personId }, payload);

    return reply.send({});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/updatePassenger.js',
      error: err?.message,
      method: 'updatePassenger',
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
      message: "Não foi possível atualizar informações",
    });
  }
};

const existEmail = async (id, email) => {
  const isEmail = await PersonModel.findOne({
    _id: { $ne: id },
    email: `${email}`.toLowerCase(),
  }).lean();

  if (isEmail) {
    return true;
  }

  return false;
};

module.exports = updatePassenger;
