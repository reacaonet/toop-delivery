const mongoose = require("mongoose");
const PointSchema = require("./../utils/PointSchema");
const BankShema = require("./../utils/BankData");
const SocialShema = require("./../utils/SocialNetworks");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    address: {
      type: String,
      required: true,
    },
    complement: {
      type: String,
      required: false,
    },
    shoppingFlow: {
      type: String,
      enum: ["MENU", "PRODUCT"],
      default: "MENU",
      required: true,
    },
    type: {
      type: String,
      enum: ["supermarket", "restaurant"],
      default: "restaurant",
      required: false,
    },
    phone: {
      type: Number,
      required: false,
    },
    cnpj: {
      type: Number,
      required: false,
    },
    bankInfo: {
      type: Object,
      required: false,
    },
    addressDetail: {
      type: Object,
      required: false,
    },
    groups: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanySegment",
      required: true,
    },
    images: [String],
    imageAppHeader: {
      type: [String],
      required: false,
    },
    category: [String],
    companyDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyDelivery",
      required: false,
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: true,
    },
    // utilizado para algumas integrações inicialmente
    cnpj: {
      type: String,
      required: false,
    },
    // Excecutar algumas rotinas propria de cada company
    runProcess: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
      default: [],
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    isHighlighted: {
      type: Boolean,
      required: false,
    },
    keywords: [String],
    approved: {
      type: Boolean,
      required: false,
    },
    companyCategory: {
      type: String,
      enum: ["delivery", "service"],
      default: "delivery",
      required: true,
    },
    // informações financeira
    bankData: {
      type: BankShema,
      required: false,
    },
    socialNetwork: {
      type: SocialShema,
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
  },
  {
    timestamps: true,
    collection: "company",
  },
);

schema.index({ franchise: -1 });
schema.index({ deletedAt: -1 });
schema.index({ type: 1 });
schema.index({ status: -1 });
schema.index({ companyDelivery: 1 });
schema.index({ segment: -1 });
schema.index({ location: "2dsphere" });
schema.index({ name: "text" });
schema.index({ name: -1 });
schema.index({ keywords: -1 });
schema.index({ isHighlighted: -1 });
schema.index({ shoppingFlow: -1 });
schema.index({ companyCategory: -1 });

module.exports = mongoose.model("Company", schema, "company");
