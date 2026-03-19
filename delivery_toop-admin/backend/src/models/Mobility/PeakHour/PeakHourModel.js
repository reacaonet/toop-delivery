const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "PeakHour",
  },
);

schema.index({ status: -1 });
schema.index({ start: "text" });
schema.index({ start: -1 });
schema.index({ end: "text" });
schema.index({ end: -1 });
schema.index({ deletedAt: -1 });

module.exports = mongoose.model("PeakHour", schema, "peakHour");
