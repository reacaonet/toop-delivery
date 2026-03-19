const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    helpTicketsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpTickets",
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    origin: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "helpIicketsInterations",
  },
);

module.exports = mongoose.model("HelpTicketsInterations", schema, "helpIicketsInterations");
