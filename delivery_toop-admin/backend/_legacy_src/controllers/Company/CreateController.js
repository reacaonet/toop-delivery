const mongoose = require("mongoose");

const apiPaymentService = require("../../services/paymentApi");

const CompanyModel = require("../../models/Company/CompanyModel");
const CompanyDeliveryModel = require("../../models/Company/CompanyDeliveryModel");
const LogModel = require("../../models/LogModel");

const createAgency = require("./../../services/Finance/DigitalAccounts/createAgency");
const createAccount = require("./../../services/Finance/DigitalAccounts/createAccount");
const getAgencyFranchise = require("./../../services/Finance/DigitalAccounts/getAgencyFranchise");

const updateTypePaymentsCompanyDelivery = async (typePayments, companyId, req) => {
  return new Promise(async (resolve, reject) => {
    try {
      let companyDelivery = null;
      const isDelivery = await CompanyDeliveryModel.findOne({
        company: companyId,
        deletedAt: { $exists: false },
      }).lean();

      if (!isDelivery || !isDelivery._id) {
        companyDelivery = await CompanyDeliveryModel.create({
          typePayments: typePayments,
          company: companyId,
        });
      } else {
        await CompanyDeliveryModel.updateOne(
          { _id: isDelivery._id },
          {
            typePayments: typePayments,
          },
        );
      }

      if (companyDelivery && companyDelivery._id) {
        await CompanyModel.updateOne(
          { _id: companyId },
          {
            companyDelivery: companyDelivery._id,
          },
        );
      }

      return resolve(companyDelivery);
    } catch (error) {
      await LogModel.create({
        path: "src/controllers/Company/CreateController.js",
        error: error?.message,
        method: "updateTypePaymentsCompanyDelivery",
        type: "error",
        level: 0,
        origin: "backend",
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

      return reject(error);
    }
  });
};

const createReceiverSplit = async (data, req) => {
  return new Promise(async (resolve, reject) => {
    // Integração com Pagar.me
    try {
      // Create
      // Doc https://docs.pagar.me/v4/reference#criando-um-recebedor
      let payloadPagarme = {
        external_id: data._id,
        transfer_interval: "weekly",
        transfer_day: 5, // 5 = sexta
        transfer_enabled: true,
        bank_account: {
          bank_code: data.bankData.brazilianBank.compe, // Número da conta. Max 3 caracteres numéricos
          agencia: data.bankData.agency, // Número da agência. Max 4 caracteres
          conta: data.bankData.account, // Número da conta. Max: 13 caracteres numéricos
          conta_dv: data.bankData.accountDigit || "", // Digitos validadores da conta. Max 2 caracteres numéricos
          document_number: data.bankData.document,
          legal_name: data.bankData.favoredName, // Nome da conta. Max: 30 caracteres
          type: data.bankData.typeAccount === "CURRENT" ? "conta_corrente" : "conta_poupanca",
        },
      };

      if (data.bankData.agencyDigit) {
        payloadPagarme.agencia_dv = data.bankData.agencyDigit; // Número da agência. Max 4 caracteres
      }

      const { data: pagarMe } = await apiPaymentService.post("/pagar-me/recipient", payloadPagarme);

      return resolve(pagarMe.data);
    } catch (error) {
      await LogModel.create({
        path: "src/controllers/Company/CreateController.js",
        error: error?.message,
        method: "createReceiverSplit",
        type: "error",
        level: 0,
        origin: "backend",
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

      return reject(error);
    }
  });
};

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    // if (!data.file || typeof data.file !== "object") {
    //   return res.status(400).send({
    //     message: "Imagens inválidas",
    //   });
    // }

    if (!data.lng || !data.lat) {
      return res.status(400).send({
        message: "Campos 'latitude' e 'longitude' são obrigatórios",
      });
    }

    data.location = {
      type: "Point",
      coordinates: [Number(data.lng), Number(data.lat)],
    };

    // Trata status
    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    data.images = [];
    data.imageAppHeader = [];

    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }

    if (data.imageHeader && Array.isArray(data.imageHeader)) {
      data.imageHeader.forEach(item => data.imageAppHeader.push(item.url));
    }

    if (!data.imageHeader || typeof data.imageHeader !== "object") {
      delete data.imageHeader;
      delete data.imageAppHeader;
    }

    if (data.category) {
      data.category = data.category
        .toLocaleString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(",");
    }

    // const createDigitalAccount = data.createDigitalAccount;
    // delete data.createDigitalAccount;

    if (data.bankData) {
      if (data.bankData.pixType === null || data.bankData.pixType === undefined) {
        delete data.bankData.pixType;
      }
    }

    // SPLIT RECEIVER
    // if (data.bankData.brazilianBank && data.bankData.account) {
    //   try {
    //     if (data.bankData.brazilianBank.compe) {
    //       const splitReceiver = await createReceiverSplit(data, req);

    //       if (splitReceiver.id && splitReceiver.bank_account.id) {
    //         data.recipient_id = splitReceiver.id;
    //         data.pagar_me_bank_id = splitReceiver.bank_account.id;
    //       }
    //     } else {
    //       return res.status(400).send({
    //         message: "Selecione um Banco válido! Falha ao cadastrar dados do Split.",
    //         error: "Selecione um Banco válido! Falha ao cadastrar dados do Split.",
    //         log: "Selecione um Banco válido! Falha ao cadastrar dados do Split.",
    //       });
    //     }
    //   } catch (error) {
    //     const logErro = error.response && error.response.data ? error.response.data : [];
    //     return res.status(400).send({
    //       message: "Falha ao cadastrar dados do Split. Revise os dados e tente novamente.",
    //       error: error.message,
    //       log: logErro,
    //     });
    //   }
    // }

    if (data.socialNetwork) {
      if (data.socialNetwork.whatsapp) {
        data.socialNetwork.whatsapp = `+55${data.socialNetwork.whatsapp}`;
      }
    }

    const company = await CompanyModel.create(data);

    if (data.typePayments && Array.isArray(data.typePayments)) {
      await updateTypePaymentsCompanyDelivery(data.typePayments, data._id, req);
    }

    // if (createDigitalAccount) {
    //   const agency = await getAgencyFranchise(company.franchise);
    //   if (agency) {
    //     await createAccount(agency._id, company._id, "PJ", "Company");
    //   }
    // }

    return res.send({
      status: 200,
      message: "Empresa criada com sucesso",
      data: company,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Company/CreateController.js",
      error: err?.message,
      method: "CreateController",
      type: "error",
      level: 0,
      origin: "backend",
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

    console.log(err);
    return res.status(400).send({
      message: "Falha ao criar Empresa",
      Error: err.message,
    });
  }
};
