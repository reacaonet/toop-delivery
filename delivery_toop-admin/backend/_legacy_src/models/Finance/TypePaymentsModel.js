const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["MONEY", "CARD", "BRASPAG", "PIX", "PIX_DIRECT"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    image: [String],
    status: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "fncTypePayments",
  },
);

schema.index({ type: -1 });
schema.index({ status: -1 });

module.exports = mongoose.model("FncTypePayments", schema, "fnc_typePayments");
