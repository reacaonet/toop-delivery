const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    module: {
        type: mongoose.Types.ObjectId,
        ref: 'SettingModule',
        required: true,
    },
    route: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
}, {
    timestamps: true,
    collection: "settingController"
});

schema.index({module: 1, status: 1});

module.exports = mongoose.model('SettingController', schema, 'settingController');