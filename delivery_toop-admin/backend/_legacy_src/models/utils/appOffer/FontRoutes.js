const mongoose = require('mongoose');

const FontRoutesShema = new mongoose.Schema({
  route: {
    type: String,
    require: false,
  },
  action: {
    type: String,
    enum: ["LOAD", "CLICK", "WAIT", "INPUT"],
    required: true,
  }
})

module.exports = FontRoutesShema;
