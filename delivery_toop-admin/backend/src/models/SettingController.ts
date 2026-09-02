import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingController extends Document {
  name: string;
  module: mongoose.Types.ObjectId;
  route: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingControllerSchema = new Schema<ISettingController>(
  {
    name: { type: String, required: true, trim: true },
    module: { type: Schema.Types.ObjectId, ref: 'SettingModule', required: true },
    route: { type: String, required: true, trim: true },
    status: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SettingControllerSchema.index({ module: 1, status: 1 });
SettingControllerSchema.index({ route: 'text' });

export const SettingControllerModel = mongoose.model<ISettingController>('SettingController', SettingControllerSchema, 'settingController');
