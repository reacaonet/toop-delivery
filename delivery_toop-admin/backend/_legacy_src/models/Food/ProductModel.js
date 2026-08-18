const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    images: [String],
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodCategory",
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    pricesSizesPizzas: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    pricePromotion: {
      type: Number,
      required: false,
    },
    percentualDiscount: {
      type: Number,
      required: false,
    },
    codPdv: {
      type: String,
      required: false,
    },
    isPaused: {
      type: Boolean,
      required: false,
    },
    position: {
      type: Number,
      default: 1,
      required: true,
    },
    amountPeople: {
      type: String,
      enum: ["ONE", "TWO", "THREE", "FOUR"],
      default: "ONE",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "foodProduct",
  },
);

schema.index({ company: 1 });
schema.index({ category: 1 });
schema.index({ name: "text" });
schema.index({ name: -1 });
schema.index({ isPaused: 1 });
schema.index({ deletedAt: 1 });
schema.index({ position: -1 });

module.exports = mongoose.model("FoodProduct", schema, "foodProduct");
