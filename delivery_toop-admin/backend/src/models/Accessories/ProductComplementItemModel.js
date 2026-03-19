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
  accessoriesProductComplement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessoriesProductComplement',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
}, {
  timestamps: true,
  collection: "accessoriesProductComplementItem"
});

schema.index({ foodProductComplement: 1, type: -1 });
schema.index({ name: 1 });
schema.index({ isPaused: -1 });
module.exports = mongoose.model('AccessoriesProductComplementItem', schema, 'accessoriesProductComplementItem');
