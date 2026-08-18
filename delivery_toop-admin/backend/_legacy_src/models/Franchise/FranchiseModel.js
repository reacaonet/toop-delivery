const mongoose = require("mongoose");

const PointSchema = require("./../utils/PointSchema");
const BankShema = require("./../utils/BankData");
const SettingsRaceSchema = require("./util/SettingsRaceModel");
const SettingsDriveSchema = require("../Admin/util/SettingsDriveModel");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SettingState",
      required: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SettingCity",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    // informações financeira
    bankData: {
      type: BankShema,
      required: false,
    },
    bankInfo: {
      type: Object,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    cep: {
      type: Number,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
    },
    onlyMultiplesOf50: {
      /**
       * arredondar valores alto
       * ex: de 130 para 150
       * de 270 para 300
       */
      type: Boolean,
      required: false,
    },
    emergencyPhone: {
      type: String,
      required: false,
      default: "190",
    },
    images: [String],
    activateTip: {
      type: Boolean,
      required: true,
      default: true,
    },
    percentService: {
      // porcentagem cobrado do admin da franquia
      type: Number,
      required: true,
      default: 5,
      min: 0,
      max: 100,
    },
    coin: {
      type: String,
      enum: ["R$", "€", "$", "₲", "Kz"],
      required: true,
      default: "R$",
    },
    languageDefault: {
      type: String,
      enum: ["pt-BR", "pt-PT", "pt-AO", "pt"],
      required: true,
      default: "pt-BR",
    },
    serviceDefault: {
      type: String,
      enum: ["delivery", "service", "drive"],
      required: true,
      default: "delivery",
    },
    fixedservicefee: {
      // valor fixo cobrado do admin da franquia
      type: Number,
      default: 0,
      required: false,
    },
    // Used in Split gatway payment
    recipient_id: {
      type: String,
      required: false,
    },
    // Used in Split gatway payment pagar.me
    pagar_me_bank_id: {
      type: String,
      required: false,
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    showPhoneRace: {
      driver: {
        type: Boolean,
        required: false,
        default: false,
      },
      passenger: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    routeSettings: {
      showReportCardTravel: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    settingsDriver: {
      type: SettingsDriveSchema,
      required: false,
    },
    settingsRace: {
      type: SettingsRaceSchema,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "franchise",
  },
);

schema.index({ type: 1 });
schema.index({ status: -1 });
schema.index({ name: "text" });
schema.index({ name: -1 });
schema.index({ deletedAt: 1 });

module.exports = mongoose.model("Franchise", schema, "franchise");
