const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  codPdv: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  isPaused: {
    type: Boolean,
    required: false,
  },
  foodProductComplement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodProductComplement',
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
  collection: "foodProductComplementItem"
});

schema.index({ foodProductComplement: 1 });
schema.index({ type: -1 });
schema.index({ name: -1 });
schema.index({ company: -1 });
schema.index({ isPaused: -1 });
schema.index({ deletedAt: 1 });
module.exports = mongoose.model('FoodProductComplementItem', schema, 'foodProductComplementItem');
