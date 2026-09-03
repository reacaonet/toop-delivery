import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingCity extends Document {
  name: string;
  state: mongoose.Types.ObjectId;
  deletedAt?: Date;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingCitySchema = new Schema<ISettingCity>(
  {
    name: { type: String, required: true, trim: true },
    state: { type: Schema.Types.ObjectId, ref: 'SettingState', required: true },
    deletedAt: { type: Date },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SettingCitySchema.index({ name: 'text' });
SettingCitySchema.index({ state: 1 });

export const SettingCityModel = mongoose.model<ISettingCity>('SettingCity', SettingCitySchema, 'settingCity');
