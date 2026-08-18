const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  modules: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SettingModule',
    required: true,
  },
  status: {
    type: Boolean,
    required: false,
  }
}, {
  timestamps: true,
  collection: "acessGroup"
})

module.exports = mongoose.model('AcessGroup', schema, 'acessGroup');