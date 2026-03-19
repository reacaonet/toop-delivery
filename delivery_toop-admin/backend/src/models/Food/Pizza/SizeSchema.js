const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pieces: {
    type: Number,
    required: false,
  },
  flavors: {
    type: Number,
    required: false,
  },
  codPdv: {
    type: String,
    required: false,
  },
})

module.exports = SizeSchema;
