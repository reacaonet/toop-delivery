const moment = require("moment");

const isEmail = require("validator/lib/isEmail");
const { cpf } = require("cpf-cnpj-validator");

/** Model */
const PreRegistration = require("../../models/PreRegistration/PreRegistrationModel");
const LogModel = require("../../models/LogModel");

/** Services */
const apiPushNotification = require("../../services/notification");

const UpdateController = async (request, reply) => {
  try {
    const { id } = request.params;
    const data = request.body;

    const current = await PreRegistration.findOne({
      _id: id,
    }).lean();

    if (current && current.status === "DECLINED") {
      await PreRegistration.replaceOne(
        { _id: id },
        {
          createdAt: moment().utc(false).toDate(),
          phone: current.phone,
          status: "RESENT",
          terms: false,
        },
      );

      return reply.send({
        status: 200,
        message: "Cadastro recusado, Liberamos para que você possa cadastrar novamente",
        data: {
          _id: id,
          phone: current.phone,
          status: "RESENT",
          terms: false,
        },
      });
    }

    if (data && data.email) {
      data.email = `${data.email}`.toLowerCase().trim();

      if (isEmail(data.email) === false) {
        return reply.status(400).send({
          message: "E-mail inválido",
        });
      }
    }

    if (data.cpf) {
      if (!cpf.isValid(data.cpf)) {
        return reply.status(400).send({
          message: "Informe um CPF válido",
        });
      }

      const existRegister = await notDuplicate(id, "cpf", data.cpf);

      if (existRegister && existRegister._id) {
        return reply.status(400).send({
          message: "CPF informado já está em uso",
        });
      }
    }

    if (data.email) {
      const existRegister = await notDuplicate(id, "email", data.email);

      if (existRegister && existRegister._id) {
        return reply.status(400).send({
          message: "Email informado já está em uso",
        });
      }
    }

    if (data.password && `${data.password}`.length < 6) {
      return reply.status(400).send({
        message: "Informe uma senha com pelo menos 6 caracteres",
      });
    }

    if (data.genre) {
      if (data.genre !== "H" && data.genre !== "M") {
        return reply.status(400).send({
          message: "Selecione um gênero",
        });
      }
    }

    const novoRegistro = await PreRegistration.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: true,
        new: true,
      },
    );

    if (novoRegistro && id && novoRegistro.token && novoRegistro.status && novoRegistro.terms) {
      sendPushNotification(novoRegistro.token, novoRegistro.status, id);
    }

    reply.send({
      status: 200,
      message: "PreRegistration atualizado com sucesso",
      data: novoRegistro,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/PreRegistration/UpdateController.js',
      error: err?.message,
      method: 'UpdateController',
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

    console.log(err);

    return reply.status(400).send({
      message: "Falha ao atualizar PreRegistration",
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
    message = "Parabéns você foi aprovado no Gojá!";
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

  const existRegister = await PreRegistration.findOne(data).lean();
  return existRegister;
};

module.exports = UpdateController;
