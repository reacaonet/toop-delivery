const moment = require("moment");
const isEmail = require("validator/lib/isEmail");
const { cpf } = require("cpf-cnpj-validator");

/** Model */
const PreRegistration = require("../../models/PreRegistration/PreRegistrationModel");
const LogModel = require("../../models/LogModel");

/** Services */
const apiPushNotification = require("../../services/notification");

/** Util */
const { normalizeName, normalizeEmail, capitalize } = require("../../utils");

// eslint-disable-next-line complexity
const DynamicRegisterController = async (request, reply) => {
  try {
    const { id } = request.params;
    const { appversion } = request.headers;
    const data = request.body;

    let current = await PreRegistration.findOne({
      _id: id,
      deletedAt: { $exists: false },
    }).lean();

    if (!current || !current._id) {
      return reply.status(400).send({
        message: "Nenhum cadastro encontrado",
      });
    }

    if (data.name) {
      if (`${normalizeName(data.name)}`.length < 6) {
        return reply.status(400).send({
          message: "Insira o teu nome completo",
        });
      }
    }

    if (data && data.email) {
      data.email = normalizeEmail(data.email);

      if (isEmail(data.email) === false) {
        return reply.status(400).send({
          message: "E-mail inválido",
        });
      }
    }

    if (data.birthDate) {
      if (!moment(data.birthDate, "DD/MM/YYYY").isValid()) {
        return reply.status(400).send({
          message: "Insira uma data de nascimento válida",
        });
      }
    }

    if (data.cpf) {
      if (!cpf.isValid(data.cpf)) {
        return reply.status(400).send({
          message: "Insira um CPF válido",
        });
      }

      const existRegister = await notDuplicate(id, "cpf", data.cpf);

      if (existRegister && existRegister._id) {
        return reply.status(400).send({
          message: "CPF informado já está em uso",
        });
      }
    }

    if (data.nif) {
      if (`${data.nif}`.trim().length < 9) {
        return reply.status(400).send({
          message: "Insira um NIF válido",
        });
      }

      const existRegister = await notDuplicate(id, "nif", data.nif);

      if (existRegister && existRegister._id) {
        return reply.status(400).send({
          message: "NIF informado já está em uso",
        });
      }
    }

    if (data.genre) {
      if (data.genre !== "H" && data.genre !== "M" && data.genre !== "O") {
        return reply.status(400).send({
          message: "Selecione um gênero",
        });
      }
    }

    // Veículo
    if (data.vehicleManufacturer) {
      data.vehicleManufacturer = capitalize(data.vehicleManufacturer);
    }

    if (data.vehicleModel) {
      data.vehicleModel = capitalize(data.vehicleModel);
    }

    if (data.vehicleNameplate) {
      data.vehicleNameplate = capitalize(data.vehicleNameplate);
    }

    if (data.vehicleYear) {
      data.vehicleYear = capitalize(data.vehicleYear);
    }

    if (data.vehicleColor) {
      data.vehicleColor = capitalize(data.vehicleColor);
    }

    if (data.password && `${data.password}`.length < 6) {
      return reply.status(400).send({
        message: "Insira password com pelo menos 6 caracteres",
      });
    }

    if (data.confirmPassword) {
      if (`${current.password}` !== `${data.confirmPassword}`) {
        return reply.status(400).send({
          message: "password informado é diferente do anterior",
        });
      }
    }

    // final
    if (appversion) {
      data.appversion = `${appversion}`;
    }

    if (data?.os) {
      data.operationalSystem = `${data?.os}`;
      delete data.os;
    }

    await PreRegistration.updateOne({ _id: id }, data);

    if (current && id && current.token && current.status && current.terms) {
      sendPushNotification(current.token, current.status, id);
    }

    return reply.send(current);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/PreRegistration/DynamicRegisterController.js',
      error: err?.message,
      method: 'DynamicRegisterController',
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
      message: "Não foi cadastrar informação",
      err: err.message,
    });
  }
};

// Push
const sendPushNotification = async (token, status, _id) => {
  let title;
  let message;

  if (status === "APPROVED") {
    title = "Solicitação aprovada";
    message = "Parabéns você foi aprovado no Toop!";
  } else if (status === "ANALYZE") {
    title = "Falta pouco";
    message = "Seu cadastro está sendo analisado!";
  } else if (status === "DECLINED") {
    title = "Poxa! Não conseguimos aprovar o seu cadastro";
    message = "Não fique triste, você pode tentar novamente";
  }

  if (title && message && token) {
    try {
      await apiPushNotification.post(`/v1/app-notification/user/${_id}`, {
        user: {
          auth: token,
          message: message,
        },
        params: {
          title: title,
          message: message,
        },
      });
    } catch (err) {
      console.log("err sendPushNotification", err);
    }
  }
};

const notDuplicate = async (id, name, value) => {
  const data = {};

  data._id = {
    $ne: id,
  };

  data[`${name}`] = value;
  data.deletedAt = { $exists: false };

  const existRegister = await PreRegistration.findOne(data).lean();

  return existRegister;
};

module.exports = DynamicRegisterController;
