/** Model */
const BankModel = require("../../../models/Finance/DigitalAccounts/BankModel");

const mongoose = require("mongoose");

const get = async () => {
  try {
    const bank = await BankModel.findOne({});

    return bank;

    return false;
  } catch (err) {
    return false;
  }
};

module.exports = get;
