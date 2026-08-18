const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  serviceCharge: {
    type: Number,
    required: false,
  },
}, {
  timestamps: true,
  collection: "globalSettings"
});


module.exports = mongoose.model('GlobalSettings', schema, 'globalSettings');
