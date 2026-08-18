const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["supermarket", "restaurant", "accessories"],
      default: "supermarket",
      required: true,
    },
    showInApp: {
      type: Boolean,
      required: true,
    },
    keyword: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanySegment",
      required: true,
    },
    showHome: {
      type: Boolean,
      default: true,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    images: [String],
  },
  {
    timestamps: true,
    collection: "Category",
  },
);

schema.index({ segment: -1 });
schema.index({ name: 1 });
schema.index({ deletedAt: 1 });
schema.index({ showHome: -1 });
schema.index({ showInApp: -1 });
schema.index({ order: -1 });
schema.index({ createdAt: -1 });

module.exports = mongoose.model("Category", schema, "category");
