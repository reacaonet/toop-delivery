const { Schema } = require('mongoose');

const SettingsDriveSchema = new Schema(
  {
    creditEnableMode: {
      type: Boolean,
      default: false,
      required: false,
    },
    activePercentService: {
      // o crédito descontado equivale a porcentagem definida no serviço
      type: Boolean,
      default: false,
      required: false,
    },
    creditPrice: {
      type: Number,
      default: 0,
      required: false,
    },
    creditAmountPerRice: {
      type: Number,
      default: 0,
      required: false,
    },
    creditAmountPerAdditionalStop: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = SettingsDriveSchema;
