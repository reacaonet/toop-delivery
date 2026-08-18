const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    version: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ["ios", "android"],
      required: true,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "AppVersion",
  },
);
module.exports = mongoose.model("AppVersion", schema, "appVersion");
