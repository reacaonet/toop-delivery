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
    ref: 'Product',
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
  deletedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
  collection: "foodProductComplement"
});

schema.index({product: 1, type: -1});
schema.index({name: 1});
schema.index({ isPaused: -1 });
schema.index({ position: 1 });
schema.index({ company: 1 });
schema.index({ deletedAt: 1 });
module.exports = mongoose.model('FoodProductComplement', schema, 'foodProductComplement');
