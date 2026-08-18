const mongoose = require("mongoose");
const ScheduleSchema = require("../utils/shopping/ScheduleSchema");

const schema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "inProgress", "purchaded", "deleted", "canceled"],
      default: "pending",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    schedule: {
      type: ScheduleSchema,
      required: false,
    },
    causeCanceled: {
      type: String,
    },
    tip: {
      type: mongoose.Types.ObjectId,
      ref: "Tip",
      required: false,
    },
    fingerPrintId: {
      type: String,
      required: false,
    },
    pixTxid: {
      type: String,
      required: false,
    },
    pixDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "shoppingCart",
  },
);

schema.index({ customer: -1 });
schema.index({ type: -1 });
schema.index({ company: -1 });
schema.index({ status: -1 });
schema.index({ createdAt: -1 });
schema.index({ schedule: -1 });
schema.index({ isDeleted: 1 });
schema.index({ pixTxid: -1 });
schema.index({ pixDate: -1 });

module.exports = mongoose.model("ShoppingCart", schema, "shoppingCart");
