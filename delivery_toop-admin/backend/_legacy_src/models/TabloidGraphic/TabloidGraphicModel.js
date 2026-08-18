const mongoose = require('mongoose');

const schema = new mongoose.Schema ({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
      },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    itens: {
            type: String,
        
            required: true,
          }
    
}, {
    timestamps: true,
    collection: "tabloid"
});

module.exports = mongoose.model('TabloidGraphic', schema, 'tabloidGraphic');