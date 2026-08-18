const { Schema } = require("mongoose");

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
  date: {
    type: Date,
    required: false,
  },
  speed: {
    type: Number,
    required: false,
  },
});

module.exports = PointSchema;
