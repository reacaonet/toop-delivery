const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
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
    collection: "EmailTypes",
  },
);

module.exports = mongoose.model("EmailTypes", schema, "email_types");
