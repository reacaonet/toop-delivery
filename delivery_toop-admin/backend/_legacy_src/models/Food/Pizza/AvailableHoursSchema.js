const mongoose = require('mongoose');

const AvailableHoursSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
});

module.exports = AvailableHoursSchema;
