const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: mongoose.Types.ObjectId,
      ref: "EmailTypes",
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
    collection: "EmailTemplates",
  },
);

module.exports = mongoose.model("EmailTemplates", schema, "email_templates");
