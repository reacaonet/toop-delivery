const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
    // envio por tópico
    topic: {
      type: String,
      required: false,
    },
    // lista de usuários enviados
    user: {
      type: Schema.Types.Array,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['wait', 'success', 'error'],
      default: 'wait',
      required: false,
    },
    errMessage: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ franchise: -1 });
schema.index({ topic: -1 });
schema.index({ createdAt: -1 });

module.exports = model('PushNotification', schema, 'pushNotification');
