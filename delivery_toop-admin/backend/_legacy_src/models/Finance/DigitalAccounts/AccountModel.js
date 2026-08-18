const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    bank: {
      type: mongoose.Types.ObjectId,
      ref: "Bank",
      required: true,
    },
    agency: {
      type: mongoose.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["PF", "PJ"],
      required: true,
    },
    holder: {
      type: mongoose.Types.ObjectId,
      refPath: "onModel",
      required: true,
    },
    onModel: {
      type: String,
      required: true,
      enum: ["Company", "Person", "Franchise"],
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    openingBalance: {
      type: Number, // valor inicial da conta
      required: false,
      default: 0,
    },
    limit: {
      type: Number,
      required: false, // limite financeiro da conta, para realizaçaõ das transaçoes
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "Account",
  },
);

schema.index({ status: -1 });
schema.index({ name: "text" });
schema.index({ name: -1 });

module.exports = mongoose.model("Account", schema, "account");
