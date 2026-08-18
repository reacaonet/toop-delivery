const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productAccent: {
    type: String,
    required: true,
  },
  keywords: [String],
  description: [String],
  packing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Packing',
    required: true,
  },
  packingAmount: {
    type: Number,
    required: true,
  },
  images: [String],
  category: [String],
  brand: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('ImageBank', schema, 'imageBank');
