import mongoose, { Schema, Document } from 'mongoose';

export const PARTY_TYPES = ['company', 'franchise', 'deliveryman', 'platform'] as const;
export const SPLIT_REFERENCE_TYPES = ['order', 'booking'] as const;

export interface ISplit extends Document {
  payment?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  partyType: (typeof PARTY_TYPES)[number];
  recipientId?: mongoose.Types.ObjectId;
  name?: string;
  percent: number;
  amount: number;
  status: 'pending' | 'settled' | 'failed';
  referenceType: (typeof SPLIT_REFERENCE_TYPES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const SplitSchema = new Schema<ISplit>(
  {
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    partyType: { type: String, enum: PARTY_TYPES, required: true },
    recipientId: { type: Schema.Types.ObjectId },
    name: { type: String, trim: true },
    percent: { type: Number, required: true, min: 0, max: 100 },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'settled', 'failed'],
      default: 'pending',
    },
    referenceType: { type: String, enum: SPLIT_REFERENCE_TYPES, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SplitSchema.index({ order: 1, referenceType: 1 });
SplitSchema.index({ company: 1, createdAt: -1 });
SplitSchema.index({ partyType: 1, status: 1 });

export const SplitModel = mongoose.model<ISplit>('Split', SplitSchema);