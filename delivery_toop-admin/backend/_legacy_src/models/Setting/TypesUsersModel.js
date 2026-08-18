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
  deletedAt: {
    type: Date,
    required: false,
  },
}, {
    timestamps: true,
    collection: "settingTypesUsers"
});
module.exports = mongoose.model('SettingTypesUsers', schema, 'settingTypesUsers');