const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Franchise',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      enum: ['ALL', 'DRIVER', 'PASSENGER'],
      default: 'ALL',
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    images: [String],
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'mobilityNotification',
  },
);

schema.index({ type: 1 });
schema.index({ status: -1 });
schema.index({ description: 'text' });

module.exports = mongoose.model('MobilityNotification', schema, 'mobilityNotification');
