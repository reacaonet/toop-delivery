import mongoose, { Schema, Document } from 'mongoose';

export interface ITabloid extends Document {
  name: string;
  description: string;
  status: boolean;
  groupCompany: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TabloidSchema = new Schema<ITabloid>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Boolean, required: true },
    groupCompany: { type: Boolean, required: true },
    images: [{ type: String }],
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

export const TabloidModel = mongoose.model<ITabloid>('Tabloid', TabloidSchema, 'tabloid');
