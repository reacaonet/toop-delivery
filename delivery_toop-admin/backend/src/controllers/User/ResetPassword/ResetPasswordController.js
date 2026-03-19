const moment = require("moment");
const bcrypt = require("bcrypt");

const ResetPasswordModel = require("../../../models/ResetPasswordModel");
const DriverMododel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const resetPassword = async (request, reply) => {
  try {
    const { type, code, email, password } = request.body;

    const dataOld = moment().utc(false).subtract(5, "minutes").toDate();
    const dataCurrent = moment().utc(false).toDate();

    const isReset = await ResetPasswordModel.findOne({
      createdAt: {
        $gte: dataOld,
        $lte: dataCurrent,
      },
      code,
      email,
      type,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!isReset || !isReset._id) {
      return reply.status(400).send({
        message: "Código informado não existe ou expirou",
      });
    }

    let current = false;
    const passwordCrypt = await bcrypt.hash(`${password}`.trim(), 11);

    if (type === "driver") {
      current = await resetDriverPassword(email, passwordCrypt);
    }

    if (current === false) {
      return reply.status(400).send({
        message: "Não foi possível alterar senha",
      });
    }

    return reply.send({
      message: "Senha alterado",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/User/ResetPassword/ResetPasswordController.js',
      error: err?.message,
      method: 'resetPassword',
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

const resetDriverPassword = async (email, password) => {
  try {
    await DriverMododel.updateOne(
      {
        email,
        deletedAt: { $exists: false },
      },
      {
        password: password,
      },
    );

    return true;
  } catch (err) {
    return false;
  }
};

module.exports = resetPassword;
