const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    isMain: {
      type: Boolean,
      default: false,
      required: true,
    },
    flag: {
      type: String,
      enum: ["AMEX", "DINERS", "DISCOVER", "ELO", "MASTERCARD", "MASTER", "MAESTRO", "VISA", "OTHERS"],
      required: true,
    },
    cartNumber: {
      type: String,
      required: true,
    },
    nameOnCard: {
      type: String,
      required: true,
    },
    valid: {
      type: Date,
      required: true,
    },
    verifierCode: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ["CPF", "PASSPORT"],
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
    gateway: {
      type: String,
      enum: ["BRASPAG", "PAGARME", "IUGU"],
      default: "PAGARME",
      required: true,
    },
    cardToken: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "shoppingPaymentMethod",
  },
);

schema.index({ customer: -1 });
schema.index({ isMain: -1 });
schema.index({ isDeleted: 1 });

module.exports = mongoose.model("ShoppingPaymentMethod", schema, "shoppingPaymentMethod");
