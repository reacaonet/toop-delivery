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
  openingHours: {
    type: Number,
    required: true,
  },
  closingHours: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
  collection: "company_hours"
});

schema.index({ company: 1, type: -1 });
module.exports = mongoose.model('company_hours', schema, 'company_hours');
