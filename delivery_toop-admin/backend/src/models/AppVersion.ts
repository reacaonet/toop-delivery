import mongoose, { Schema, Document } from 'mongoose';

export interface IAppVersion extends Document {
  name: string;
  version: string;
  platform: 'ios' | 'android';
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppVersionSchema = new Schema<IAppVersion>(
  {
    name: { type: String, required: true, trim: true },
    version: { type: String, required: true, trim: true },
    platform: { type: String, enum: ['ios', 'android'], required: true },
    status: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AppVersionSchema.index({ platform: 1, status: 1 });
AppVersionSchema.index({ createdAt: -1 });

export const AppVersionModel = mongoose.model<IAppVersion>('AppVersion', AppVersionSchema, 'appVersion');
