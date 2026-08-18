import { Schema, model } from 'mongoose';
const methodPaymentDefaultSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
    },
    key: {
      type: String,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

methodPaymentDefaultSchema.index({ updatedAt: -1 });

const MethodPaymentDefaultModel= model(
  'adm_methodPaymentDefault',
  methodPaymentDefaultSchema,
  'adm_methodPaymentDefault',
);

export default MethodPaymentDefaultModel;
