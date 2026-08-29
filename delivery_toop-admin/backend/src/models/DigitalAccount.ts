import mongoose, { Schema, Document } from 'mongoose';

export interface IExtractEntry {
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  balanceAfter: number;
  reference?: mongoose.Types.ObjectId;
  referenceType?: string;
  createdAt: Date;
}

export interface IDigitalAccount extends Document {
  agency: mongoose.Types.ObjectId;
  accountNumber: string;
  digit?: string;
  holderName: string;
  holderDocument?: string;
  company?: mongoose.Types.ObjectId;
  active: boolean;
  extract: IExtractEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const ExtractEntrySchema = new Schema<IExtractEntry>(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reference: { type: Schema.Types.ObjectId },
    referenceType: { type: String },
  },
  { timestamps: true }
);

const DigitalAccountSchema = new Schema<IDigitalAccount>(
  {
    agency: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    accountNumber: { type: String, required: true, trim: true },
    digit: { type: String, trim: true },
    holderName: { type: String, required: true, trim: true },
    holderDocument: { type: String, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    active: { type: Boolean, default: true },
    extract: { type: [ExtractEntrySchema], default: [] },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

DigitalAccountSchema.index({ agency: 1, active: 1 });
DigitalAccountSchema.index({ company: 1, active: 1 });

export const DigitalAccountModel = mongoose.model<IDigitalAccount>('DigitalAccount', DigitalAccountSchema);
