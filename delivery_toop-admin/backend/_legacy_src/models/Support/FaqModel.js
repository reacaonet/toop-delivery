const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true,
  collection: "helpFaq"
});

module.exports = mongoose.model('HelpFaq', schema, 'help_Faq');