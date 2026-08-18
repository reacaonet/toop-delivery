const mongoose = require('mongoose');

const schema = new mongoose.Schema ({
    name: {
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
    groupCompany: {
        type: Boolean,
        required: true,
    },
    images: [String],
    
}, {
    timestamps: true,
    collection: "tabloid"
});

module.exports = mongoose.model('Tabloid', schema, 'tabloid');