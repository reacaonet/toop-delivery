const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    search: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    typeproduct:{
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    collection: "searchuser"
});

module.exports = mongoose.model('SearchUser', schema, 'searchuser');
