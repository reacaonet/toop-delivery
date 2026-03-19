const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  percentage: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
    required: true,
  },
  division: [
    {
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
      },
      percentage: Number,
    }
  ],
})

module.exports = schema;
