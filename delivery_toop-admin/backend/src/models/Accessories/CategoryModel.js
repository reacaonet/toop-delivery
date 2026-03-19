const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  isPaused: {
    type: Boolean,
    default: false,
    required: true,
  },
  position: {
    type: Number,
    default: 1,
    required: true,
  },
}, {
  timestamps: true,
  collection: "accessoriesCategory"
});

schema.index({ company: 1 });
schema.index({ name: 1 });
schema.index({ isPaused: -1 });
module.exports = mongoose.model('AccessoriesCategory', schema, 'accessoriesCategory');
