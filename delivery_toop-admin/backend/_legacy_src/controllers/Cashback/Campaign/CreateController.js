const mongoose = require("mongoose");

const CashbackCampaignModel = require("../../../models/Cashback/CashbackCampaignModel");
const LogModel = require('../../../models/LogModel');

const getAccount = require("../../../services/Finance/DigitalAccounts/getAccount");
const getAgency = require("../../../services/Finance/DigitalAccounts/getAgencyFranchise");
const BankTransactions = require("../../../services/Finance/DigitalAccounts/BankTransactions");
const AccountBalanceModel = require("../../../models/Finance/DigitalAccounts/AccountBalanceModel");

const UserModel = require("../../../models/UserModel");

module.exports = async (req, res) => {
  try {
    const { isRoot, isCompany, isFranchise, franchise, franchises } = req;

    const data = req.body;

    if (!data.name) {
      return res.status(400).send({
        message: "Informe um nome Válido",
      });
    }

    if (!isRoot) {
      if (isFranchise && !franchise) {
        return res.status(400).send({
          message: "Informe um proprietário Válido",
        });
      } else if (isFranchise && franchise) {
        data.franchise = franchise;
      }
    } else {
      delete data.franchise;
    }

    if (!data.percent) {
      return res.status(400).send({
        message: "Informe a % de desconto",
      });
    }

    if (!data.amount) {
      return res.status(400).send({
        message: "Informe o valor que será aprovisionado para a campanha",
      });
    }

    if ((await checkBalanceAccount(data.amount, req)) === false) {
      return res.status(402).send({
        message: "Saldo insuficiente na conta digital! Efetue um depósito.",
      });
    }

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    delete data._id;

    if (data.companies) data.companies = data.companies.filter(i => i !== "");
    if (data.franchises) data.franchises = data.franchises.filter(i => i !== "");

    data.balance = data.amount;

    const campaign = await CashbackCampaignModel.create(data);

    createTransaction(campaign, req);

    return res.send({
      status: 200,
      message: "Campanha criada com sucesso",
      data: campaign,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Cashback/Campaign/CreateController.js',
    error: dadosDoErro?.message,
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


    console.log(dadosDoErro);

    return res.status(400).send({
      message: "Falha ao criar Campanha",
      Error: dadosDoErro,
    });
  }
};

async function checkBalanceAccount(amount, req) {
  const { isRoot, isCompany, isFranchise, franchise, franchises } = req;
  if (isFranchise && req.franchise) {
    const account = await getAccount(req.franchise, "Franchise", await getAgency(req.franchise)._id, true);

    return account.balance >= amount;
  } else if (isRoot) {
    const user = await UserModel.findOne({ isRoot: true });

    const account = await getAccount(user.company, "Company", null, true);

    return account.balance >= amount;
  }

  return false;
}

async function createTransaction(campaign, req) {
  const { isRoot, isCompany, isFranchise, franchise, franchises } = req;

  let account;

  if (isFranchise && req.franchise) {
    account = await getAccount(req.franchise, "Franchise", await getAgency(req.franchise)._id, true);
  } else if (isRoot) {
    const user = await UserModel.findOne({ isRoot: true });
    account = await getAccount(user.company, "Company", null, true);
  }

  const transaction = await BankTransactions({
    originAgency: account.agency,
    destinationAgency: account.agency,
    originAccount: account._id,
    destinationAccount: account._id,
    value: campaign.amount,
    type: "debit",
    status: "COMPLETED",
    description: `Dédito Ref. Campanha de cashback ${campaign.name}`,
  });

  console.log("transaction => ", transaction);

  await CashbackCampaignModel.findByIdAndUpdate(campaign._id, {
    transaction: transaction._id,
  });
}
