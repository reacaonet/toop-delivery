const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
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

const CreditModel = model("Credit", schema, "credit");

module.exports = CreditModel;
