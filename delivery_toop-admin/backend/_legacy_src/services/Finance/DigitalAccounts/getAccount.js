const mongoose = require("mongoose");

/** Model */
const AccountModel = require("../../../models/Finance/DigitalAccounts/AccountModel");
const AgencyModel = require("../../../models/Finance/DigitalAccounts/AgencyModel");

const AccountBalanceModel = require("../../../models/Finance/DigitalAccounts/AccountBalanceModel");

const createAccount = require("./createAccount");
const createAgency = require("./createAgency");

const get = async (_id, type, franchise, createNotExist = false) => {
  try {
    if (_id && !mongoose.Types.ObjectId.isValid(_id)) return false;
    //if (franchise && !mongoose.Types.ObjectId.isValid(franchise)) return false;

    // busca agencia pela franquia
    let agency = await AgencyModel.findOne({ franchise: franchise });

    // caso não exista agencia e o parametro solicitar a criação
    // então cria e retorna a nova agencia criada
    if (!agency && createNotExist) agency = await createAgency(franchise, "Agência");

    let account = await AccountModel.findOne({
      holder: mongoose.Types.ObjectId(_id),
      agency: agency._id,
      status: true,
      deletedAt: { $exists: false },
    });

    // caso não exista conta criada e o parametro solicitar a criação
    // então cria e retorna a nova conta criada
    if (!account && createNotExist) account = await createAccount(agency._id, _id, type, "");

    let balance = await AccountBalanceModel.findOne({
      account: account._id,
    }).sort({ createdAt: -1 });

    balance = balance ? balance.balance : 0;

    return { ...account.toJSON(), balance };
  } catch (err) {
    console.log(" erro ao criar conta digital => ", err);
    return false;
  }
};

module.exports = get;
