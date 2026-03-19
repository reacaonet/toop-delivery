const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: "Customer",
      default: true,
    },
    cashPrev: {
      type: Number,
      required: true,
      //min: 0,
    },
    cash: {
      type: Number,
      required: true,
      //min: 0,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ customer: -1 });
schema.index({ date: -1 });

module.exports = mongoose.model(
  "CashbackCustomerBalance",
  schema,
  "cashback_customer_balance"
);
