const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
      required: false,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: false,
    },
    percent: {
      type: Number,
      required: false,
      min: 1,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["single", "monthly", "period"],
    },
    amountAvailable: {
      type: Number,
      required: false,
      min: 1,
    },
    amountUsed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ franchise: -1 });
schema.index({ active: -1 });
schema.index({ passenger: -1 });
schema.index({ service: -1 });
schema.index({ startDate: -1 });
schema.index({ endDate: -1 });
schema.index({ type: -1 });
schema.index({ createdAt: -1 });

const VoucherModel = model("VoucherDiscount", schema, "voucherDiscount");

module.exports = VoucherModel;
