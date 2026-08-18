const mongoose = require("mongoose");

/** Model */
const BankTransactionsModel = require("../../../models/Finance/DigitalAccounts/BankTransactionsModel");

const { uniqueID } = require("./../../../utils/");

const create = async params => {
  try {
    if (!params.value || !params.type) {
      return false;
    }

    if (params.originAccount && !mongoose.Types.ObjectId.isValid(params.originAccount)) {
      return false;
    }
    if (params.originAgency && !mongoose.Types.ObjectId.isValid(params.originAgency)) {
      return false;
    }

    if (!mongoose.Types.ObjectId.isValid(params.destinationAccount)) {
      return false;
    }
    if (!mongoose.Types.ObjectId.isValid(params.destinationAgency)) {
      return false;
    }

    const transaction = await BankTransactionsModel.create({
      transactionCode: params.code ? params.code : uniqueID(),
      ...params,
    });

    return {
      _id: transaction._id,
      transactionCode: transaction.transactionCode,
      transaction,
    };
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = create;
