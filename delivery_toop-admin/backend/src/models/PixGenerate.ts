import mongoose, { Schema, Document } from 'mongoose';

export interface IPixGenerate extends Document {
  cart: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  txid: string;
  qrcode: string;
  amount: number;
  response?: Record<string, unknown>;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  expiresAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PixGenerateSchema = new Schema<IPixGenerate>(
  {
    cart: { type: Schema.Types.ObjectId, ref: 'ShoppingCart', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    txid: { type: String, required: true, index: true },
    qrcode: { type: String, required: true },
    amount: { type: Number, required: true },
    response: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['pending', 'paid', 'expired', 'failed'], default: 'pending' },
    expiresAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true, collection: 'pixGenerate' }
);

PixGenerateSchema.index({ cart: 1, status: 1 });

export const PixGenerateModel = mongoose.model<IPixGenerate>(
  'PixGenerate',
  PixGenerateSchema,
  'pixGenerate'
);