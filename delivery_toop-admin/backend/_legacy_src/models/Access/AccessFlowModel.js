const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    history: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "AcsFlow",
  }
);

module.exports = mongoose.model("AcsFlow", schema, "acs_flow");