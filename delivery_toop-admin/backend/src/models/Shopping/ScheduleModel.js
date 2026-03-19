const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  company: {
    type: mongoose.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  dayWeek: {
    type: String,
    enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
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
  deletedAt: {
    type: Date,
    required: false,
  },
  type: {
    type: String,
    enum: ['BOTH', 'DELIVERY', 'WITHDRAWAL'],
    default: 'BOTH',
    required: true,
  },
}, {
  timestamps: true,
  collection: "Schedule"
});

schema.index({ company: 1, type: -1 });
module.exports = mongoose.model('Schedule', schema, 'schedule');
