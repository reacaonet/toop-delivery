import mongoose, { Schema, Document } from 'mongoose';

export interface IAgency extends Document {
  name: string;
  code: string;
  bank: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AgencySchema = new Schema<IAgency>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    bank: { type: Schema.Types.ObjectId, ref: 'Bank', required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AgencySchema.index({ bank: 1, active: 1 });
AgencySchema.index({ code: 1 });

export const AgencyModel = mongoose.model<IAgency>('Agency', AgencySchema);
