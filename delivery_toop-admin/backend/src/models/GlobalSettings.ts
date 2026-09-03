import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalSettings extends Document {
  serviceCharge?: number;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalSettingsSchema = new Schema<IGlobalSettings>(
  {
    serviceCharge: { type: Number },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

export const GlobalSettingsModel = mongoose.model<IGlobalSettings>(
  'GlobalSettings',
  GlobalSettingsSchema,
  'globalSettings'
);
