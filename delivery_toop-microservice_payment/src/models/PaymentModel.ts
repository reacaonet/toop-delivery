// const mongoose = require('mongoose');

import mongoose, {Schema} from 'mongoose';

const schema: Schema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  shoppingCart: {
    type: mongoose.Types.ObjectId,
    ref: 'ShoppingCart',
    required: true,
  },
  company: {
    type: mongoose.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  paymentProviderId: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.SchemaTypes.Mixed,
    required: true,
  },
  capture: {
    type: Boolean,
    default: false,
    required: true,
  },
  braspagNotification: {
    type: [
      mongoose.Schema.Types.Mixed,
    ],
    required: false,
  },
  statusNotification: {
    type: [
      mongoose.Schema.Types.Mixed,
    ],
    required: false,
  },
}, {
  timestamps: true,
  collection: 'payment',
});

schema.index({
  customer: -1,
  shoppingCart: -1,
  createdAt: -1,
  paymentProviderId: -1,
});

export default mongoose.model('Payments', schema, 'payment');
