const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    description: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "Bank",
  }
);

schema.index({ status: -1 });
schema.index({ name: "text" });
schema.index({ name: -1 });

module.exports = mongoose.model("Bank", schema, "bank");
