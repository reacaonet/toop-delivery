const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    images: [String],
    category: {
      type: String,
      enum: ["delivery", "service"],
      default: "delivery",
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
  },
  {
    timestamps: true,
    collection: "companySegment",
  },
);

schema.index({ deletedAt: -1 });
schema.index({ category: -1 });
schema.index({ images: -1 });
schema.index({ order: -1 });
schema.index({ createdAt: -1 });

module.exports = mongoose.model("CompanySegment", schema, "companySegment");
