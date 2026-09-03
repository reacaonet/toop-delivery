import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingState extends Document {
  name: string;
  uf: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingStateSchema = new Schema<ISettingState>(
  {
    name: { type: String, required: true, trim: true },
    uf: { type: String, required: true, uppercase: true, trim: true },
    country: { type: String, default: 'BRASIL', trim: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SettingStateSchema.index({ name: 'text' });

export const SettingStateModel = mongoose.model<ISettingState>('SettingState', SettingStateSchema, 'settingState');
