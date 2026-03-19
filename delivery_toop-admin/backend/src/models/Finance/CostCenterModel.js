const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "CostCenter",
  },
);

module.exports = mongoose.model("CostCenter", schema, "costCenter");
