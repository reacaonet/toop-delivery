const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    offset: {
      type: Number,
      min: -14,
      max: 13,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "timeZone",
  },
);

schema.index({ offset: -1 });

const TimeZoneModel = model("TimeZone", schema, "timeZone");
module.exports = TimeZoneModel;
