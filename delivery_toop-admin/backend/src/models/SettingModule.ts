import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingModule extends Document {
  name: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingModuleSchema = new Schema<ISettingModule>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SettingModuleSchema.index({ status: 1 });
SettingModuleSchema.index({ name: 'text' });

export const SettingModuleModel = mongoose.model<ISettingModule>('SettingModule', SettingModuleSchema, 'settingModule');
