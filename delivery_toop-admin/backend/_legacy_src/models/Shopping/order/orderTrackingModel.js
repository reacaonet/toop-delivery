const mongoose = require('mongoose');
const PointSchema = require('../../utils/PointSchema');

const schema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payments',
    required: true,
  },
  shoppingCart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppingCart',
    required: true,
  },
  location: {
    type: PointSchema,
    index: '2dsphere',
    required: true,
  },
}, {
  timestamps: true,
  collection: "orderStatus"
});

module.exports = mongoose.model('OrderTracking', schema, 'orderTracking');


