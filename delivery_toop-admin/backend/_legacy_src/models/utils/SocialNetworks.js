const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  whatsapp: {
    type: String,
    required: false,
  },
  instagram: {
    type: String,
    required: false,
  },
  facebook: {
    type: String,
    required: false,
  },
});

module.exports = schema;
