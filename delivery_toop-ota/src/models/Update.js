const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  app: {
    type: String,
    required: true,
    enum: ['client', 'deliveryman', 'driver', 'shopper']
  },
  platform: {
    type: String,
    required: true,
    enum: ['android', 'ios']
  },
  version: {
    type: String,
    required: true
  },
  buildNumber: {
    type: Number,
    default: 1
  },
  bundleHash: {
    type: String,
    required: true
  },
  bundleSize: {
    type: Number,
    required: true
  },
  bundlePath: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rolloutPercentage: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  minAppVersion: {
    type: String,
    default: null
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

updateSchema.index({ app: 1, platform: 1, version: 1 });
updateSchema.index({ app: 1, platform: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Update', updateSchema);
