const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["system", "user"],
      default: "user",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "tip",
  }
);

module.exports = mongoose.model("Tip", schema, "tip");
