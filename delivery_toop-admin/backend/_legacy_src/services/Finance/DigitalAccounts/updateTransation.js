/** Model */
const BankTransactionsModel = require("../../../models/Finance/DigitalAccounts/BankTransactionsModel");

const mongoose = require("mongoose");

const byID = async (_id, data) => {
  try {
    if (_id && !mongoose.Types.ObjectId.isValid(_id)) {
      return false;
    }

    const transaction = await BankTransactionsModel.findOneAndUpdate(
      { _id },
      data
    );

    return transaction;
  } catch (err) {
    return false;
  }
};

const byCode = async (transactionCode, data) => {
  try {
    const transaction = await BankTransactionsModel.updateMany(
      { transactionCode },
      data
    );

    return transaction;
  } catch (err) {
    return false;
  }
};

module.exports = { byCode, byID };
