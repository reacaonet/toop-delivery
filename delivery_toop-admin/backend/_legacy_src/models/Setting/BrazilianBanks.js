const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    compe: {
      type: String,
      required: true,
    },
    ispb: {
      type: String,
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
    long_name: {
      type: String,
      required: true,
    },
    short_name: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    pix_type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "SettingBrazilianBanks",
  },
);

schema.index({ compe: -1 });
schema.index({ long_name: -1 });
schema.index({ short_name: -1 });

module.exports = mongoose.model("SettingBrazilianBanks", schema, "settingBrazilianBanks");
