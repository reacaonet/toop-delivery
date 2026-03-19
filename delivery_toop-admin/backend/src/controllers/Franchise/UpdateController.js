const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const apiPaymentService = require("../../services/paymentApi");
const FranchiseModel = require("../../models/Franchise/FranchiseModel");
const LogModel = require("../../models/LogModel");
const { getCoordinate } = require("../../utils");

module.exports = async (req, res) => {
  try {
    const franchiseId = req.params.id;
    const data = req.body;
    data.images = [];

    if (`${data.status}` === "false" || `${data.status}` === "true") {
      data.status = `${data.status}` === "true" ? true : false;
    }

    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images = [];
      data.images.push(data.url);
    }

    if (!data.file || typeof data.file !== "object") {
      delete data.file;
      delete data.images;
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

    data.showPhoneRace = {
      driver: data?.showPhoneDriver === true || data?.showPhoneDriver === "true" ? true : false,
      passenger: data?.showPhonePassenger === true || data?.showPhonePassenger === "true" ? true : false,
    };

    // let pagarMeData;
    // try {
    //   // Check if create or update split subordnate
    //   // https://api.pagar.me/1/recipients/recipient_id
    //   if (data.recipient_id && data.pagar_me_bank_id) {
    //     // Payload pagar.me
    //     // Doc https://docs.pagar.me/v4/reference#criando-um-recebedor
    //     const payloadPagarme = {
    //       id: data.recipient_id,
    //       bank_account_id: data.pagar_me_bank_id,
    //       bank_account: {
    //         bank_code: data.bankData.brazilianBank.compe, // Número da conta. Max 3 caracteres numéricos
    //         agencia: data.bankData.agency, // Número da agência. Max 4 caracteres
    //         agencia_dv: data.bankData.agencyDigit, // Número da agência. Max 4 caracteres
    //         conta: data.bankData.account, // Número da conta. Max: 13 caracteres numéricos
    //         conta_dv: data.bankData.accountDigit || "", // Digitos validadores da conta. Max 2 caracteres numéricos
    //         document_number: data.bankData.document,
    //         legal_name: data.bankData.favoredName, // Nome da conta. Max: 30 caracteres
    //         type: data.bankData.typeAccount === "CURRENT" ? "conta_corrente" : "conta_poupanca",
    //       },
    //     };
    //     const { data: pagarMe } = await apiPaymentService.put(`/pagar-me/recipient/${data.recipient_id}`, payloadPagarme);
    //     pagarMeData = pagarMe.data;
    //   } else {
    //     // Create
    //     // Doc https://docs.pagar.me/v4/reference#criando-um-recebedor
    //     const payloadPagarme = {
    //       external_id: data._id,
    //       transfer_interval: "weekly",
    //       transfer_day: 5, // 5 = sexta
    //       transfer_enabled: true,
    //       bank_account: {
    //         bank_code: data.bankData.brazilianBank.compe, // Número da conta. Max 3 caracteres numéricos
    //         agencia: data.bankData.agency, // Número da agência. Max 4 caracteres
    //         agencia_dv: data.bankData.agencyDigit, // Número da agência. Max 4 caracteres
    //         conta: data.bankData.account, // Número da conta. Max: 13 caracteres numéricos
    //         conta_dv: data.bankData.accountDigit || "", // Digitos validadores da conta. Max 2 caracteres numéricos
    //         document_number: data.bankData.document,
    //         legal_name: data.bankData.favoredName, // Nome da conta. Max: 30 caracteres
    //         type: data.bankData.typeAccount === "CURRENT" ? "conta_corrente" : "conta_poupanca",
    //       },
    //     };

    //     const { data: pagarMe } = await apiPaymentService.post("/pagar-me/recipient", payloadPagarme);
    //     pagarMeData = pagarMe.data;
    //   }
    // } catch (error) {

    //   const logErro = error.response && error.response.data ? error.response.data : [];
    //   return res.status(400).send({
    //     message: "Falha ao cadastrar dados do Split. Revise os dados e tente novamente.",
    //     error: error.message,
    //     log: logErro,
    //   });
    // }

    // const { id, bank_account } = pagarMeData;

    const registerUpdate = await FranchiseModel.findOneAndUpdate(
      {
        _id: franchiseId,
      },
      {
        // recipient_id: id,
        // pagar_me_bank_id: bank_account.id,
        ...data,
      },
      {
        upsert: false,
        new: true,
      },
    );

    res.send({
      status: 200,
      message: "Franquia atualizada com sucesso",
      data: registerUpdate,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Franchise/UpdateController.js",
      error: err?.message,
      method: "UpdateController",
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

    return res.status(400).send({
      message: "Falha ao atualizar franquia",
      Error: err.message,
      rr: err,
    });
  }
};
