const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    shoppingCart: {
      type: mongoose.Types.ObjectId,
      ref: "ShoppingCart",
      required: true,
    },
    txid: {
      type: String,
      required: true,
    },
    qrcode: {
      type: String,
      required: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    valueTip: {
      type: Number,
      required: false,
    },
    typeSchedule: {
      type: String,
      enum: ["DELIVERY", "WITHDRAWAL"],
      default: "DELIVERY",
      required: false,
    },
    deliveryFree: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  { timestamps: true },
);

schema.index({ shoppingCart: -1 });
schema.index({ txid: -1 });

module.exports = mongoose.model("PixGenerate", schema, "pixGenerate");
