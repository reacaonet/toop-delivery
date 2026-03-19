const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    info: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },

    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "priceCalculation",
  },
);

schema.index({ type: 1 });
schema.index({ status: -1 });
schema.index({ name: "text" });
schema.index({ name: -1 });

module.exports = mongoose.model("PriceCalculation", schema, "priceCalculation");
