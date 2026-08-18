const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    popup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "popup",
      required: true,
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "person",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "popupView",
  }
);

module.exports = mongoose.model("PopupView", schema, "popupView");
