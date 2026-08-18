const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    category: {
      type: String,
      require: true,
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
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "filter",
  }
);

module.exports = mongoose.model("Filter", schema, "filter");
