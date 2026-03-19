const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    allCompanies: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    dateInit: {
      type: Date,
      required: true,
    },
    dateFinish: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    minPriceDelivery: {
      type: Number,
      required: true,
    },
    limit: {
      type: Number,
      default: 1,
      required: true,
    },
    onlyFirstPurchase: {
      type: Boolean,
      default: false,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "coupon",
  },
);

schema.index({ franchise: -1 });
schema.index({ dateInit: -1 });
schema.index({ dateFinish: -1 });
schema.index({ status: -1 });
schema.index({ price: -1 });
schema.index({ minPriceDelivery: -1 });
schema.index({ deletedAt: -1 });

module.exports = mongoose.model("Coupon", schema, "coupon");
