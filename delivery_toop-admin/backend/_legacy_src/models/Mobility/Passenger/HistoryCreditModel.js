const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const HistoryModel = model("HistoryCredit", schema, "historyCredit");

module.exports = HistoryModel;
