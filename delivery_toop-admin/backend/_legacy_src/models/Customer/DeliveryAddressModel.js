const mongoose = require('mongoose');

const PointSchema = require('../utils/PointSchema');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  location: {
    type: PointSchema,
    index: '2dsphere',
    required: true,
  },
  main: {
    type: Boolean,
    default: false,
    required: true,
  },
  number: {
    type: Number,
    required: false,
  },
  complement: {
    type: String,
    required: false,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  referencePoint: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    enum: ['RESIDENCIA', 'HOME', 'WORK'],
    required: false,
  },
  addressRoute: {
    type: String,
    required: false,
  },
  addressRegion: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  district: {
    type: String,
    required: false
  },
  streetNumber: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  zipcode: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true,
  },
}, {
  timestamps: true,
  collection: "customer_delivery_address"
});

schema.index({ customer: 1});
schema.index({ type: -1 });
schema.index({ main: 1});
schema.index({ isDeleted: 1 });


module.exports = mongoose.model('CustomerDeliveryAddress', schema, 'customer_delivery_address');
