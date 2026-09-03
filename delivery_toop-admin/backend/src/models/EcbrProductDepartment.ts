import mongoose, { Schema, Document } from 'mongoose';

export interface IEcbrProductDepartment extends Document {
  name: string;
  barcode: string;
  keywords?: string[];
  images?: string[];
  departments?: mongoose.Types.ObjectId[];
  weight?: string;
  description?: string;
  copyright: boolean;
  status: boolean;
  audited?: boolean;
  companyAdded?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EcbrProductDepartmentSchema = new Schema<IEcbrProductDepartment>(
  {
    name: { type: String, required: true },
    barcode: { type: String, required: true, unique: true },
    keywords: { type: [String], required: false },
    images: { type: [String], required: false },
    departments: { type: [Schema.Types.ObjectId], required: false },
    weight: { type: String, required: false },
    description: { type: String, required: false },
    copyright: { type: Boolean, default: false, required: true },
    status: { type: Boolean, required: true, default: true },
    audited: { type: Boolean, required: false },
    companyAdded: { type: Schema.Types.ObjectId, required: false },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } },
  }
);

EcbrProductDepartmentSchema.index({ barcode: -1 });
EcbrProductDepartmentSchema.index({ status: -1 });
EcbrProductDepartmentSchema.index({ createdAt: -1 });
EcbrProductDepartmentSchema.index({ updatedAt: -1 });
EcbrProductDepartmentSchema.index({ copyright: -1 });
EcbrProductDepartmentSchema.index({ departments: -1 });
EcbrProductDepartmentSchema.index({ images: -1 });

export const EcbrProductDepartmentModel = mongoose.model<IEcbrProductDepartment>(
  'EcbrProductDepartment',
  EcbrProductDepartmentSchema,
  'ecbr_ProductDepartment'
);
