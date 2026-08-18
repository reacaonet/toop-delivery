const referralCodeGenerator = require("referral-code-generator");
const sgMail = require("@sendgrid/mail");

/** Model */
const ResetPasswordModel = require("../../../models/ResetPasswordModel");
const DriverMododel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const createCode = async (request, reply) => {
  try {
    const { type, email } = request.body;

    let current = null;

    if (type === "driver") {
      current = await getDriver(email);
    }

    if (!current || !current.email) {
      return reply.status(400).send({
        message: "E-mail não encontrado",
      });
    }

    const code = referralCodeGenerator.alphaNumeric("uppercase", 2, 2);

    const create = await ResetPasswordModel.create({
      type,
      email,
      code,
    });

    if (!create || !create._id) {
      return reply.status(400).send({
        message: "Não foi possível gerar código",
      });
    }

    const responseEmail = await sendEmail(email, code);

    if (responseEmail === false) {
      return reply.status(400).send({
        message: "Não foi possível enviar e-mail",
      });
    }

    return reply.send({
      code,
      responseEmail,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/User/ResetPassword/CreateCodeController.js',
      error: err?.message,
      method: 'createCode',
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
      message: "Não foi possivel seguir com esqueci a senha ...",
      err: err.message,
    });
  }
};

const getDriver = async email => {
  const response = await DriverMododel.findOne({
    email: email,
    deletedAt: {
      $exists: false,
    },
  })
    .select({
      email: 1,
      status: true,
    })
    .lean();

  return response;
};

const sendEmail = async (email, code) => {
  try {
    sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);

    const info = await sgMail.send({
      to: email, // Enviar para
      from: `${process.env.SENDGRID_EMAIL_FROM}`, // Remetente
      subject: `Reset de senha no ${process.env.APP_NAME}`,
      html: `
        <p>
          Informe o código <b>${code}</b> para gerar uma nova senha
        </p>
        <p>
          Este código é válido por 5 minutos
        </p>
      `,
    });

    if (!info) {
      return false;
    }

    return info;
  } catch (err) {
    return false;
  }
};

module.exports = createCode;
