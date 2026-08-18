const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  isOnline: {
    type: Boolean,
    default: false,
    required: true,
  },
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  device: {
    type: String,
    required: false,
  },
  token: {
    type: String,
    required: false,
  },
  status: {
    type: Boolean,
    required: true,
  },
  appVersion: {
    type: String,
    required: false,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
  collection: "shopper"
})

module.exports = mongoose.model('Shopper', schema, 'shopper');
