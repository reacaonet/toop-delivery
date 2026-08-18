const mongoose = require('mongoose');

const CompanyDistanceShema = new mongoose.Schema({
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  delivery_time: {
    type: Number,
    required: true,
  },
  minPriceDeliveryFree: {
    type: Number,
    required: false,
  },
})

module.exports = CompanyDistanceShema;
