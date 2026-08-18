const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    images: [String],
    name: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    priorities: {
      type: Number,
      default: 0,
      required: true,
    },
    vizualizations: {
      type: Number,
      default: 0,
      required: true,
    },
    quantityViews: {
      type: Number,
      default: 0,
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    textMessageButton: {
      type: String,
      required: false,
      default: "",
    },
    width: {
      type: Number,
      default: 0,
      required: false,
    },
    height: {
      type: Number,
      default: 0,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    redirectTo: {
      type: String,
      enum: ["HOME", "URL", "ROUTE"],
      default: "HOME",
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    startHour: {
      type: Number,
      required: true,
      default: 0,
    },
    endHour: {
      type: Number,
      required: true,
      default: 2359,
    },
  },
  {
    timestamps: true,
    collection: "popup",
  }
);

module.exports = mongoose.model("Popup", schema, "popup");
