const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      required: false,
    },
    password: {
      type: String,
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
    collection: 'franchise',
  },
);

schema.index({ type: 1 });
schema.index({ status: -1 });
schema.index({ name: 'text' });
schema.index({ name: -1 });

module.exports = mongoose.model('Franchise', schema, 'franchise');
