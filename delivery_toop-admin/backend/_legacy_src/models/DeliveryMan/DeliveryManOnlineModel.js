const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  deliveryMan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryMan',
    required: true,
  },
  online: {
    type: Date,
    required: true,
  },
  offline: {
    type: Date,
    required: false,
  },
  total: {
    type: Number,
    required: false,
  },
}, {
  timestamps: true,
  collection: 'deliveryManOnline'
});


module.exports = mongoose.model('DeliveryManOnline', schema, 'deliveryManOnline');
