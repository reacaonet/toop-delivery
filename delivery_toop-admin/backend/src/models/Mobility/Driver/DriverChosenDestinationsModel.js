const { Schema, model } = require("mongoose");

const PointSchema = require("../../utils/PointSchema");

const schema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    location: {
      type: PointSchema,
      index: "2dsphere",
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ location: "2dsphere" });
schema.index({ driver: -1 });
schema.index({ createdAt: -1 });

const ChosenDestinationsModel = model("DriverChosenDestinations", schema, "driverChosenDestinations");
module.exports = ChosenDestinationsModel;
