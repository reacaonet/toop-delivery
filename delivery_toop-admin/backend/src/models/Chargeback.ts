import mongoose, { Schema, Document } from 'mongoose';

export interface IChargeback extends Document {
  order: mongoose.Types.ObjectId;
  payment: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'reversed';
  createdAt: Date;
  updatedAt: Date;
}

const ChargebackSchema = new Schema<IChargeback>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'reversed'],
      default: 'pending',
    },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

ChargebackSchema.index({ order: 1 });
ChargebackSchema.index({ payment: 1 });
ChargebackSchema.index({ company: 1, status: 1 });

export const ChargebackModel = mongoose.model<IChargeback>('Chargeback', ChargebackSchema);
