const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    value: {
      type: Number,
      required: true,
    },

    code: {
      // codigo
      type: String,
      required: true,
    },
    limit: {
      // quantidade disponível para uso
      type: Number,
      required: true,
    },
    used: {
      // histórico de uso dos vouchers
      type: [Schema.Types.Mixed],
      require: false,
      default: [],
    },
    dateInit: {
      type: Date,
      required: true,
    },
    dateFinish: {
      type: Date,
      required: true,
    },
    franchise: {
      type: Schema.Types.ObjectId,
      ref: 'Franchise',
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'Voucher',
  },
);

schema.index({ status: -1 });
schema.index({ franchise: -1 });
schema.index({ name: 'text' });
schema.index({ name: -1 });
schema.index({ deletedAt: -1 });
schema.index({ code: 'text' });
schema.index({ code: -1 });

const Voucher = model('Voucher', schema, 'voucher');
module.exports = Voucher;
