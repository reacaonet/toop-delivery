const mongoose = require("mongoose");

const DoughSchema = require("./Pizza/DoughSchema");
const EdgeSchema = require("./Pizza/EdgeSchema");
const SizeSchema = require("./Pizza/SizeSchema");
const DaysOfWeekSchema = require("./Pizza/DaysOfWeekSchema");
const AvailableHoursSchema = require("./Pizza/AvailableHoursSchema");

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
    isPaused: {
      type: Boolean,
      default: false,
      required: true,
    },
    position: {
      type: Number,
      default: 1,
      required: true,
    },
    type: {
      type: String,
      enum: ["PIZZAS", "ITEMS"],
      default: "ITEMS",
      required: true,
    },
    billing_mode: {
      type: String,
      enum: ["HIGHEST_VALUE", "PROPORTIONAL_VALUE", ""],
      default: "PROPORTIONAL_VALUE",
    },
    dough: {
      type: [DoughSchema],
      required: false,
    },
    edges: {
      type: [EdgeSchema],
      required: false,
    },
    sizes: {
      type: [SizeSchema],
      required: false,
    },
    alwaysAvailable: {
      type: Boolean,
      default: true,
      required: true,
    },
    daysOfWeek: {
      type: [DaysOfWeekSchema],
      required: false,
    },
    availableHours: {
      type: [AvailableHoursSchema],
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "foodCategory",
  },
);

schema.index({ company: 1 });
schema.index({ name: 1 });
schema.index({ isPaused: -1 });
schema.index({ deletedAt: 1 });
module.exports = mongoose.model("FoodCategory", schema, "foodCategory");
