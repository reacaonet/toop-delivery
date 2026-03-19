const mongoose = require("mongoose");
const PointSchema = require('../utils/PointSchema');

const schema = new mongoose.Schema({
  device: {
    type: String,
    required: true,
  },
  location: {
    type: PointSchema,
    index: '2dsphere',
    required: false,
  },
},
{
  timestamps: true,
  collection: "guest",
});

schema.index({device: 1});

module.exports = mongoose.model("Guest", schema, "guest");
