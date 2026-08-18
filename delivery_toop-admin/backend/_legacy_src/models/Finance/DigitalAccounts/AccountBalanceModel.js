const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    prevBalance: {
      type: Number,
      required: false, // // balance do dia anterior
      default: 0,
    },
    inputs: {
      type: Number,
      required: false, // entradas do dia
      default: 0,
    },
    outputs: {
      type: Number,
      required: false, // saidas do dia
      default: 0,
    },
    balance: {
      type: Number,
      required: false, // balance do dia
      default: 0,
    },
    date: {
      type: Date,
      required: true, // dia do balanço
    },
  },
  {
    timestamps: true,
    collection: "AccountBalance",
  },
);

module.exports = mongoose.model("AccountBalance", schema, "account_balance");
