const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  companyScheduleId: {
    type: mongoose.Types.ObjectId,
    ref: 'Schedule',
    required: true,
  },
  startHour: {
    type: Number,
    required: true,
  },
  endHour: {
    type: Number,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  }
})

module.exports = ScheduleSchema;
