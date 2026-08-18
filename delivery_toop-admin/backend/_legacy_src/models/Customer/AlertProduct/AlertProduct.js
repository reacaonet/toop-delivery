const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  barcode: {
    type: String,
    required: false,
  },
  priceClick: {
    type: Number,
    required: true,
  },
  followingAt: {
    type: mongoose.Schema.Types.Date,
    required: true,
    default: Date.now
  },
  unfollowedAt: {
    type: mongoose.Schema.Types.Date,
    required: false,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
});

schema.index({company: -1});
schema.index({customer: -1});
schema.index({product: -1});
schema.index({active: -1});
schema.index({followingAt: -1});
schema.index({unfollowedAt: -1});

module.exports = mongoose.model(
  'CustomerAlertProduct', schema, 'customer_alert_product'
);
