const mongoose = require("mongoose");

const CompanyDistanceShema = require("../utils/CompanyDistanceShema");

const schema = new mongoose.Schema(
  {
    isOpen: {
      type: Boolean,
      required: true,
      default: false,
    },
    isManual: {
      type: Boolean,
      required: true,
      default: false,
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    typePayments: {
      type: [mongoose.Types.ObjectId],
      ref: "FncTypePayments",
      default: [],
      required: true,
    },
    cieloMerchantId: {
      type: String,
      required: false,
    },
    mdr: {
      type: Number,
      default: 0,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
      required: true,
    },
    distance: {
      type: [CompanyDistanceShema],
      required: false,
    },
    max_distance: {
      type: Number,
      default: 10000,
      required: true,
    },
    max_distance_withdraw: {
      type: Number,
      default: 10000,
      required: true,
    },
    min_purchase: {
      type: Number,
      default: 0,
      required: true,
    },
    max_amount_items: {
      type: Number,
      default: 0,
      required: true,
    },
    time_to_call_delivery: {
      type: Number,
      default: 0,
      required: true,
    },
    mediaRating: {
      type: Number,
      default: "",
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    own_delivery: {
      type: Boolean,
      required: true,
      default: false,
    },
    online_delivery: {
      // se é permitido entregador do aplicativo
      type: Boolean,
      required: true,
      default: true,
    },
    has_split: {
      // se tem split
      type: Boolean,
      required: true,
      default: false,
    },
    withdrawMarket: {
      type: Boolean,
      default: false,
    },
    shippingInfo: {
      freeShipping: {
        type: Boolean,
        required: false,
        default: false,
      },
      freeShippingAbove: {
        type: Number,
        required: false,
        default: 0,
      },
      activatedBy: {
        // define quem ativou a opção de frete gratis
        type: String,
        required: false,
      },
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "CompanyDelivery",
  },
);

schema.index({ company: -1 });
schema.index({ deletedAt: 1 });

module.exports = mongoose.model("CompanyDelivery", schema, "company_delivery");
