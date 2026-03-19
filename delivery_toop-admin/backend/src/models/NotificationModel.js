const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["customer", "all"],
      default: "all",
      required: false,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Customer",
      required: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    totalUsers: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "notification",
  },
);

schema.index({ franchise: -1 });
schema.index({ company: -1 });
schema.index({ type: -1 });
schema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", schema, "notification");
