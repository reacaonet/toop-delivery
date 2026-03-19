const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    typeSystem: {
      type: String,
      enum: ["MOBILE", "WEB", "BACKEND", "UNDEFINED"],
      default: "UNDEFINED",
      required: true,
    },
    typeLog: {
      type: String,
      enum: ["WARN", "ERROR", "ALERT", "SUCCESS", "UNDEFINED"],
      default: "UNDEFINED",
      required: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: "",
    },
    category: {
      type: String,
      required: false,
    },
    originError: {
      type: String,
      required: false,
    },
    path: {
      type: String,
      required: false,
    },
    error: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    method: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["error"],
      required: false,
    },
    level: {
      type: Number,
      required: false,
    },
    origin: {
      type: String,
      enum: ["backend", "frontend"],
      required: false,
    },
    request: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "log",
  },
);

schema.index({ createdAt: -1 });
schema.index({ typeLog: -1 });
schema.index({ category: -1 });

module.exports = mongoose.model("Log", schema, "log");
