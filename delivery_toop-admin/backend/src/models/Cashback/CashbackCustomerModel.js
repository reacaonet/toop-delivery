const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payments",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderStatus",
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CashbackCampaign",
      required: false,
    },
    percent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    cash: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ customer: -1 });
schema.index({ payment: -1 });
schema.index({ order: -1 });
schema.index({ campaign: -1 });
schema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "CashbackCustomer",
  schema,
  "cashback_customer"
);
