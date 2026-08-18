const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  }
},
{ timestamps: true }
);

schema.index({topic: -1});

module.exports = mongoose.model('NotifTopic', schema, 'notif_topic');
