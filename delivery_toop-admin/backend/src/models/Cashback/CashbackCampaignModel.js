const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    // company: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Company",
    //   required: false,
    // },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: false,
    },
    allApp: {
      type: Boolean,
      required: false,
      default: false,
    },

    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: false,
      },
    ],
    franchises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Franchise",
        required: false,
      },
    ],
    percent: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transactions",
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "CashbackCampaign",
  },
);

schema.index({ name: -1 });
schema.index({ coupon: -1 });
schema.index({ allApp: -1 });
schema.index({ status: -1 });
schema.index({ startDate: -1 });
schema.index({ endDate: -1 });
schema.index({ deletedAt: -1 });

module.exports = mongoose.model("CashbackCampaign", schema, "cashback_campaign");
