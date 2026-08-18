const mongoose = require('mongoose');

const EdgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
  },
  status: {
    type: Boolean,
    required: false,
  }
})

module.exports = EdgeSchema;
