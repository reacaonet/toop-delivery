const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  status: {
    type: Boolean,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  domain: {
    type: String,
    required: false,
  },
  URLlogo: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  about: {
    type: String,
    required: false,
  },
  slider: {
    type: String,
    required: false,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
  collection: "Site"
});

module.exports = mongoose.model('Site', schema, 'site');