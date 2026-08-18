const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");

const apiPaymentService = require("../../services/paymentApi");
const LogModel = require("./../../models/LogModel");
const BankShema = require("./../../models/utils/BankData");
const createAgency = require("./../../services/Finance/DigitalAccounts/createAgency");
const createAccount = require("./../../services/Finance/DigitalAccounts/createAccount");
const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const { getCoordinate } = require("../../utils");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    // Trata status
    data.status = true;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }

    if (!data.email || !validator.isEmail(data.email)) {
      // validar email utils
      return res.status(400).send({
        message: "Informe um E-mail válido",
      });
    }

    const emailResp = await existEmail(data.email);
    if (emailResp) {
      return res.status(400).send({
        message: "Email já se encontra cadastrado",
      });
    }

    if (data.city && data.state) {
      const respCoord = await getCoordinate(`${data.city.name} - ${data.state.name}`);
      if (respCoord && respCoord.lat) {
        data.location = {
          type: "Point",
          coordinates: [Number(respCoord.lng), Number(respCoord.lat)],
        };
      }
    }

    const isCreateAccount = data.createAccount;
    delete data.createAccount;

    if (data.bankData) {
      if (data.bankData.pixType === null || data.bankData.pixType === undefined) {
        delete data.bankData.pixType;
      }
    }

    data.showPhoneRace = {
      driver: data?.showPhoneDriver === true || data?.showPhoneDriver === "true" ? true : false,
      passenger: data?.showPhonePassenger === true || data?.showPhonePassenger === "true" ? true : false,
    };

    // Integração com Pagar.me
    // try {
    //   // Create
    //   // Doc https://docs.pagar.me/v4/reference#criando-um-recebedor
    //   const payloadPagarme = {
    //     external_id: data._id,
    //     transfer_interval: "weekly",
    //     transfer_day: 5, // 5 = sexta
    //     transfer_enabled: true,
    //     bank_account: {
    //       bank_code: data.bankData.brazilianBank.compe, // Número da conta. Max 3 caracteres numéricos
    //       agencia: data.bankData.agency, // Número da agência. Max 4 caracteres
    //       agencia_dv: data.bankData.agencyDigit, // Número da agência. Max 4 caracteres
    //       conta: data.bankData.account, // Número da conta. Max: 13 caracteres numéricos
    //       conta_dv: data.bankData.accountDigit || "", // Digitos validadores da conta. Max 2 caracteres numéricos
    //       document_number: data.bankData.document,
    //       legal_name: data.bankData.favoredName, // Nome da conta. Max: 30 caracteres
    //       type: data.bankData.typeAccount === "CURRENT" ? "conta_corrente" : "conta_poupanca",
    //     },
    //   };

    //   const { data: pagarMe } = await apiPaymentService.post("/pagar-me/recipient", payloadPagarme);

    //   if (pagarMe.data) {
    //     data.recipient_id = pagarMe.data.id;
    //     data.pagar_me_bank_id = pagarMe.data.bank_account.id;
    //   }
    // } catch (error) {

    //   const logErro = error.response && error.response.data ? error.response.data : [];
    //   return res.status(400).send({
    //     message: "Falha ao cadastrar dados do Split. Revise os dados e tente novamente.",
    //     error: error.message,
    //     log: logErro,
    //   });
    // }

    // Save Franchise
    const franchise = await FranchiseModel.create(data);

    if (isCreateAccount) {
      const agency = await createAgency(franchise._id, franchise.name);
      await createAccount(agency._id, franchise._id, "PJ", "Franchise", "0000001");
    }

    return res.send({
      status: 200,
      message: "Franquia criada com sucesso",
      data: franchise,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Franchise/CreateController.js',
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
      message: "Falha ao criar Franquia",
      Error: err.message,
    });
  }
};

const existEmail = async email => {
  let isEmail = await FranchiseModel.findOne({
    email,
    deletedAt: {
      $exists: false,
    },
  }).lean();
  if (isEmail) {
    return true;
  }
  return false;
};
