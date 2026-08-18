const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amountMax: {
    type: Number,
    required: true,
  },
  amountMin: {
    type: Number,
    required: true,
  },
  isRequired: {
    type: Boolean,
    required: false,
  },
  isQuantified: {
    type: Boolean,
    required: false,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessoriesProduct',
    required: true,
  },
  isPaused: {
    type: Boolean,
    required: false,
  },
  position: {
    type: Number,
    default: 1,
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
}, {
  timestamps: true,
  collection: "accessoriesProductComplement"
});

schema.index({product: 1, type: -1});
schema.index({name: 1});
schema.index({ isPaused: -1 });
module.exports = mongoose.model('AccessoriesProductComplement', schema, 'accessoriesProductComplement');
