const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    device: {
      type: String,
      required: false,
    },
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: false,
    },
    version: {
      type: String,
      required: false,
    },
    history: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "accessFlow",
  },
);

module.exports = mongoose.model("AccessFlow", schema, "accessFlow");
