const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    bank: {
      type: mongoose.Types.ObjectId,
      ref: "Bank",
      required: true,
    },
    franchise: {
      type: mongoose.Types.ObjectId,
      ref: "Franchise",
    },
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
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
    collection: "Agency",
  },
);

schema.index({ status: -1 });
schema.index({ name: "text" });
schema.index({ name: -1 });

module.exports = mongoose.model("Agency", schema, "agency");
