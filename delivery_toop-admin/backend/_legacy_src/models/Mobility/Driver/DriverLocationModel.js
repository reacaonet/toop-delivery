const { Schema, model } = require("mongoose");

const PointSchema = require("../../utils/PointSchema");

const schema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: false,
    },
    distance: {
      type: Number,
      required: false,
    },
    travelledDistance: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ driver: -1 });
schema.index({ booking: -1 });
schema.index({ createdAt: -1 });

const DriverLocationModel = model("DriverLocation", schema, "driverLocation");

module.exports = DriverLocationModel;
