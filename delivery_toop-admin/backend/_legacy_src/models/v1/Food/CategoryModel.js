const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },

}, {
    timestamps: true,
    collection: "v1Category"
});
module.exports = mongoose.model('V1Category', schema, 'v1Category');
