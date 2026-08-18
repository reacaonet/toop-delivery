const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
      type: String,
      require: true,
    },
    uf: {
     type: String,
     required: true,
    },
    country: {
      type: String,
      default: "BRASIL"
       },
}, {
    timestamps: true,
    collection: "settingState"
});
module.exports = mongoose.model('SettingState', schema, 'settingState');