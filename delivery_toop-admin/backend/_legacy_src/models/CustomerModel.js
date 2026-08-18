const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    iugu_id: {
      // ID DO CLIENTE NA IUGU PAGAMENTOS
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    ddi: {
      type: String,
      default: "+55",
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    device: {
      type: String,
      required: false,
    },
    instanceIdToken: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    favoriteRestaurants: {
      type: [],
      required: false,
    },
    favoriteSupermarkets: {
      type: [],
      required: false,
    },
    termsNotAccepted: {
      type: Boolean,
      required: true,
      default: true,
    },
    sku: {
      type: String,
      required: false,
    },
    appVersion: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    rating: {
      stars: {
        type: Number,
      },
      comment: {
        type: String,
      },
      dateRating: {
        type: Date,
      },
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "customer",
  },
);

schema.index({ phone: -1 });
schema.index({ email: -1 });
schema.index({ person: -1 });
schema.index({ createdAt: -1 });
schema.index({ updatedAt: -1 });

schema.index({ token: -1 });

module.exports = mongoose.model("Customer", schema, "customer");
