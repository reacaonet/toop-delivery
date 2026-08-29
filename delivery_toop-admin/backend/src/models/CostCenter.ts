import mongoose, { Schema, Document } from 'mongoose';

export interface ICostCenter extends Document {
  name: string;
  company?: mongoose.Types.ObjectId;
  description?: string;
  code?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CostCenterSchema = new Schema<ICostCenter>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    description: { type: String },
    code: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CostCenterSchema.index({ company: 1, active: 1 });
CostCenterSchema.index({ code: 1 });

export const CostCenterModel = mongoose.model<ICostCenter>('CostCenter', CostCenterSchema);
