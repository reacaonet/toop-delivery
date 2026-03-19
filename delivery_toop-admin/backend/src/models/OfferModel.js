const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
    },
    groupCompany: { 
        type: Boolean,
        required: true,
    },
    cost: {
        type: Number,
        required: true,   
    },
    status:{ 
        type: Boolean,
        required: true,
    },
    description: { 
        type: String,
        required: true,
    },
    images: [String],
    
}, {
    timestamps: true,
    collection: "offer"
});

module.exports = mongoose.model('Offer', schema, 'offer');