import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingTypesUsers extends Document {
  name: string;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SettingTypesUsersSchema = new Schema<ISettingTypesUsers>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: Boolean, required: true, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SettingTypesUsersSchema.index({ status: 1 });
SettingTypesUsersSchema.index({ name: 'text' });

export const SettingTypesUsersModel = mongoose.model<ISettingTypesUsers>(
  'SettingTypesUsers',
  SettingTypesUsersSchema,
  'settingTypesUsers'
);
