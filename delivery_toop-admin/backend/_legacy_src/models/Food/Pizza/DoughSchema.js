const mongoose = require('mongoose');

const DoughSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
  },
  codPdv: {
    type: String,
    required: false,
  },
  status: {
    type: Boolean,
    required: false,
  }
})

module.exports = DoughSchema;
