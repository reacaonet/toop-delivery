const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
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
    images: [String],
  },
  {
    timestamps: true,
    collection: "group",
  },
);

schema.index({ name: "text" });
schema.index({ name: -1 });

module.exports = mongoose.model("Group", schema, "group");
