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
  date: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true,
  collection: "race_canceled"
});

module.exports = mongoose.model('RaceCanceled', schema, 'raceCanceled');
