import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingDepartmentMobile extends Document {
  franchise?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  name: string;
  showInApp: boolean;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingDepartmentMobileSchema = new Schema<IShoppingDepartmentMobile>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    name: { type: String, unique: true, required: true },
    showInApp: { type: Boolean, default: true, required: true },
    status: { type: Boolean, default: true, required: true },
    deletedAt: { type: Date, required: false },
  },
  { timestamps: true, collection: 'departmentmobile' }
);

ShoppingDepartmentMobileSchema.index({ name: 1 });
ShoppingDepartmentMobileSchema.index({ franchise: 1 });
ShoppingDepartmentMobileSchema.index({ company: 1 });

export const ShoppingDepartmentMobileModel = mongoose.model<IShoppingDepartmentMobile>(
  'ShoppingDepartmentMobile',
  ShoppingDepartmentMobileSchema,
  'departmentmobile'
);