const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tickedId: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW',
  },
  department: {
    type: String,
    enum: ['ADMINISTRATIVE', 'COMMERCIAL', 'MARKETING', 'FINANCIAL', 'SUPPORT', 'TI'],
    default: 'SUPPORT',
  },
  status: {
    type: String,
    enum: ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'SOLVED'],
    default: 'NEW',
  },
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: Number,
    required: false,
  },
  order: {
    type: mongoose.Types.ObjectId,
    required: false,
    ref: "OrderStatus",
  },
  images: {
    type: [String],
    required: false,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
  collection: "helpTickets"
});

module.exports = mongoose.model('HelpTickets', schema, 'helpTickets');
