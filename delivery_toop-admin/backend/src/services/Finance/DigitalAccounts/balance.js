/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose = require("mongoose");

/** Model */
const AccountModel = require("../../../models/Finance/DigitalAccounts/AccountModel");
const BankTransactionsModel = require("../../../models/Finance/DigitalAccounts/BankTransactionsModel");

const getCustomerBalance = async customer_id => {
  try {
    if (customer_id && !mongoose.Types.ObjectId.isValid(customer_id)) return false;

    const accounts = await AccountModel.find({
      customer: new mongoose.Types.ObjectId(customer_id),
      status: true,
      deletedAt: { $exists: false },
    });

    if (!accounts || accounts.length <= 0) {
      return { balance: 0, input: 0, output: 0 };
    }

    const balance = await getBalance(accounts);

    return balance;
  } catch (err) {
    console.log("erro ao consultar saldo da conta digital do cliente => ", err);

    return false;
  }
};

const getCustomerPassengerBalance = async (customer_id, passenger_id) => {
  try {
    if (customer_id && !mongoose.Types.ObjectId.isValid(customer_id) && passenger_id && !mongoose.Types.ObjectId.isValid(passenger_id)) {
      return false;
    }

    const accounts = await AccountModel.find({
      holder: new mongoose.Types.ObjectId(passenger_id),
      status: true,
      deletedAt: { $exists: false },
    });

    if (!accounts || accounts.length <= 0) {
      return { balance: 0, input: 0, output: 0 };
    }

    const balance = await getBalance(accounts);

    return balance;
  } catch (err) {
    console.log("erro ao consultar saldo da conta digital do cliente => ", err);

    return false;
  }
};

const getBalance = async (accounts = []) => {
  const filterCredit = {
    $and: [
      {
        $or: [
          {
            destinationAccount: {
              $in: accounts.map(i => new mongoose.Types.ObjectId(i._id)),
            },
          },
        ],
      },
    ],
  };

  const filterDebit = {
    $and: [
      {
        $or: [
          {
            originAccount: {
              $in: accounts.map(i => new mongoose.Types.ObjectId(i._id)),
            },
          },
        ],
      },
    ],
  };

  const balanceDebit = await BankTransactionsModel.aggregate([
    {
      $match: {
        status: "COMPLETED",
        ...filterDebit,
      },
    },
    {
      $group: {
        _id: 1,
        output: {
          $sum: {
            $cond: {
              if: { $eq: ["$type", "debit"] },
              then: "$value",
              else: 0,
            },
          },
        },
      },
    },
  ]);

  const balanceCredit = await BankTransactionsModel.aggregate([
    {
      $match: {
        status: "COMPLETED",
        ...filterCredit,
      },
    },
    {
      $group: {
        _id: 1,
        input: {
          $sum: {
            $cond: {
              if: { $eq: ["$type", "credit"] },
              then: "$value",
              else: 0,
            },
          },
        },
      },
    },
  ]);

  return {
    balance: (balanceCredit.length ? balanceCredit[0].input : 0) - (balanceDebit.length ? balanceDebit[0].output : 0),
    input: balanceCredit.length ? balanceCredit[0].input : 0,
    output: balanceDebit.length ? balanceDebit[0].output : 0,
  };
};

module.exports = {
  getCustomerBalance,
  getCustomerPassengerBalance,
};
