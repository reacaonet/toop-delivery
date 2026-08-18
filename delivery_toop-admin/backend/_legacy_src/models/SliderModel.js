const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    // Utilizado para click no slider e ir para company - lista de produtos
    companyClick: {
      type: Boolean,
      default: false,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodProduct",
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
    vizualizations: {
      type: Number,
      required: false,
    },
    priorities: {
      type: String,
      required: true,
    },
    images: [String],
    deletedAt: {
      type: Date,
      required: false,
    },
    type: {
      type: String,
      enum: ["slider", "banner", "driver"],
      default: "slider",
      required: true,
    },
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanySegment",
      required: false,
    },
    category: {
      type: String,
      enum: ["delivery", "service"],
      default: "delivery",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "slider",
  },
);

schema.index({ company: -1 });
schema.index({ deletedAt: -1 });
schema.index({ type: -1 });
schema.index({ segment: -1 });
schema.index({ createdAt: -1 });
schema.index({ category: -1 });

module.exports = mongoose.model("Slider", schema, "slider");
