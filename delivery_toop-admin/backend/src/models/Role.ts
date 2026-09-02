import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String },
    status: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

RoleSchema.index({ name: 'text' });

export const RoleModel = mongoose.model<IRole>('AclRoles', RoleSchema, 'acl_roles');
