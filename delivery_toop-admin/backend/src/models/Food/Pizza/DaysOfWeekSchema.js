const mongoose = require('mongoose');

const DaysOfWeekSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = DaysOfWeekSchema;
