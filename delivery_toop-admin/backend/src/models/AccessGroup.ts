import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessGroup extends Document {
  name: string;
  modules: mongoose.Types.ObjectId;
  status?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccessGroupSchema = new Schema<IAccessGroup>(
  {
    name: { type: String, required: true, trim: true },
    modules: { type: Schema.Types.ObjectId, ref: 'SettingModule', required: true },
    status: { type: Boolean },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

AccessGroupSchema.index({ name: 'text' });

export const AccessGroupModel = mongoose.model<IAccessGroup>('AcessGroup', AccessGroupSchema, 'acessGroup');
