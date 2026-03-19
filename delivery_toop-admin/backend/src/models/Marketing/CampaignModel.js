const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  disseminationVehicle: {
    type: String,
    required: true,
  },
  initialDate: {
    type: Date,
    required: true,
  },
  finalDate: {
    type: Date,
    required: true,
  },
  dowloadAndroid: {
    type: Number,
    required: true,
  },
  dowloadIos: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  image: {
    type: [String],
    required: false,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
  collection: "Campaign"
});

module.exports = mongoose.model('Campaign', schema, 'campaign');