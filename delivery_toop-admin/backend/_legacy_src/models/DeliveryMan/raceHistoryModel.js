const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  deliveryMan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryMan',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderStatus',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyAddress: {
    type: String,
    required: false,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  paymentPriceDelivery: {
    type: Number,
    required: false,
  },
  distanceToCompany: {
    type: Number,
    required: false,
  },
  distanceTotal: {
    type: Number,
    required: false,
  },
  statusRace: {
    type: String,
    enum: ['ACCEPTED', 'REFUSED', 'CANCELED'],
    required: true,
  }
}, {
  timestamps: true,
  collection: "raceHistory"
});

module.exports = mongoose.model('RaceHistory', schema, 'raceHistory');
