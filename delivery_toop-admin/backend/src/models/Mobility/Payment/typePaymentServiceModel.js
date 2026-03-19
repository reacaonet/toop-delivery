const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["MONEY", "CARD", "BRASPAG", "PAGARME", "PIX", "ALL"],
      required: false,
    },
    genre: {
      type: String,
      enum: ["H", "M"],
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ service: -1 });
schema.index({ genre: -1 });
schema.index({ status: -1 });

const TypePaymentServiceModel = model("TypePaymentService", schema, "typePaymentService");
module.exports = TypePaymentServiceModel;
