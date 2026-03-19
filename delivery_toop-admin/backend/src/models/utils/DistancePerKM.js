const { Schema } = require("mongoose");

const schema = new Schema({
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  priceMinute: {
    type: Number,
    required: true,
  },
  priceKM: {
    type: Number,
    required: true,
  },
});

module.exports = schema;
