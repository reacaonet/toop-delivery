const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'audio', 'image', 'text_alert'],
    default: 'text',
    required: true,
  },
  dataType: {
    type: String,
    required: false,
  },
  urlFile: {
    type: String,
    required: false,
  },
  shoppingCart: {
    type: mongoose.Types.ObjectId,
    ref: 'ShoppingCart',
    required: true,
  },
  person: {
    type: String,
    enum: ['customer', 'shopper', 'deliveryMan'],
    required: true,
  },
  personId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  personSend: {
    type: String,
    enum: ['customer', 'shopper', 'deliveryMan'],
    required: true,
  },
  personSendId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  flag: {
    type: String,
    required: false,
  },
  read: {
    type: Boolean,
    default: false,
    required: true,
  },
  readSend: {
    type: Boolean,
    default: false,
    required: true,
  },
  order_number: {
    type: Number,
    required: false,
  },
}, {
  timestamps: true,
  collection: "chatMessage"
});

schema.index({
  shoppingCart: 1,
  person: 1,
  personId: 1,
  personSend: 1,
  personSendId: 1,
  read: 1,
});

module.exports = mongoose.model('ChatMessage', schema, 'chatMessage');
