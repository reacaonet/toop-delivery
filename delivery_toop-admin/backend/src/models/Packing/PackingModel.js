const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: false,
    },

}, {
    timestamps: true,
    collection: "packing"
});

module.exports = mongoose.model('Packing', schema, 'packing');
