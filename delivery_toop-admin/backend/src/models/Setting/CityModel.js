const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    state: {
      type: mongoose.Types.ObjectId,
      ref: "SettingState",
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "settingCity",
  },
);
module.exports = mongoose.model("SettingCity", schema, "settingCity");
