const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true,
  },
  topics: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'NotifTopic',
    default: [],
    required: true,
  },
},
{ timestamps: true }
);

schema.index({customer: -1});
schema.index({topics: -1});

module.exports = mongoose.model('NotifCustomer', schema, 'notif_customer');
