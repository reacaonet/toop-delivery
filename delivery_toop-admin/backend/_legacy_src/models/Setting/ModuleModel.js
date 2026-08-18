const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
      type: String,
      require: true,
    },
    status: {
      type: Boolean,
      required: true,
  },
}, {
    timestamps: true,
    collection: "settingModule"
});

schema.index({status: 1});

module.exports = mongoose.model('SettingModule', schema, 'settingModule');