import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingDepartment extends Document {
  franchise?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  name: string;
  suggesteds: string[];
  showInApp: boolean;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingDepartmentSchema = new Schema<IShoppingDepartment>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    name: { type: String, unique: true, required: true },
    suggesteds: { type: [String], required: true },
    showInApp: { type: Boolean, default: true, required: true },
    status: { type: Boolean, default: true, required: true },
    deletedAt: { type: Date, required: false },
  },
  { timestamps: true, collection: 'department' }
);

ShoppingDepartmentSchema.index({ name: 1 });
ShoppingDepartmentSchema.index({ franchise: 1 });
ShoppingDepartmentSchema.index({ company: 1 });

export const ShoppingDepartmentModel = mongoose.model<IShoppingDepartment>(
  'ShoppingDepartment',
  ShoppingDepartmentSchema,
  'department'
);