const mongoose = require("mongoose");

require("../DeliveryMan/DeliveryManModel");
require("./ShopperModel");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    cpf: {
      type: String,
      required: false,
    },
    city: {
      type: mongoose.Types.ObjectId,
      ref: "SettingCity",
      required: false,
    },
    ddi: {
      type: String,
      default: "+55",
      required: false,
    },
    phone: {
      type: Number,
      required: false,
    },
    cellphone: {
      type: Number,
      required: false,
    },
    birthdate: {
      type: Date,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
    },
    devices: {
      type: Array,
      required: false,
    },
    genre: {
      type: String,
      enum: ["H", "M"],
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    referralCode: {
      type: String,
      required: false,
      unique: true,
    },
    timeZone: {
      type: String,
      default: "America/Sao_Paulo",
      required: false,
    },
    utc: {
      type: Number,
      default: -3, // São Paulo Brasil
      required: false,
      min: -13,
      max: 15,
    },
  },
  {
    timestamps: true,
    collection: "person",
  },
);

schema.index({ email: -1 });
schema.index({ phone: -1 });
schema.index({ status: -1 });
schema.index({ name: -1 });
schema.index({ name: "text" });
schema.index({ referralCode: -1 });

module.exports = mongoose.model("Person", schema, "person");
