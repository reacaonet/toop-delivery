import mongoose, { Schema, Document } from 'mongoose';

export interface ISortDepartment extends Document {
  department: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SortDepartmentSchema = new Schema<ISortDepartment>(
  {
    department: { type: Schema.Types.ObjectId, ref: 'ShoppingDepartment', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    order: { type: Number, min: 1, default: 1, required: true },
  },
  { timestamps: true }
);

SortDepartmentSchema.index({ company: -1 });
SortDepartmentSchema.index({ department: -1 });

export const SortDepartmentModel = mongoose.model<ISortDepartment>(
  'SortDepartment',
  SortDepartmentSchema,
  'sortDepartment'
);