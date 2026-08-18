const { isValidObjectId } = require("mongoose");
const QRCode = require("qrcode");
const referralCodeGenerator = require("referral-code-generator");

/** Model */
const QrCodeDriverModel = require("../../../models/Mobility/Driver/QrCodeDriverModel");
const LogModel = require("../../../models/LogModel");

const createController = async (request, reply) => {
  try {
    const { driver } = request.query;

    if (!driver || !isValidObjectId(driver)) {
      return reply.status(400).send({
        message: "Informe um motorista válido",
      });
    }

    const code = referralCodeGenerator.alphaNumeric("uppercase", 3, 1);

    // const data = {
    //   code,
    // };

    // const stringdata = JSON.stringify(data);
    const qrcode = await QRCode.toDataURL(`${code}`);

    if (!code || !qrcode) {
      return reply.status(400).send({
        message: "não conseguimos gerar o QRCode",
      });
    }

    const newQrcode = await QrCodeDriverModel.create({
      driver,
      code,
    });

    if (!newQrcode || !newQrcode._id) {
      return reply.status(400).send({
        message: "não conseguimos gerar o QRCode",
      });
    }

    return reply.send({
      code,
      qrcode,
    });
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Mobility/QrCode/GenerateCodeDriver.js',
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

    return reply.status(400).send({
      message: "Não foi possível gerar QR Code",
      err: err.message,
    });
  }
};

module.exports = createController;
