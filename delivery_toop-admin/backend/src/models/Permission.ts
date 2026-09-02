import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name?: string;
  roles?: mongoose.Types.ObjectId;
  route: string;
  level: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: { type: String },
    roles: { type: Schema.Types.ObjectId, ref: 'AclRoles', required: true },
    route: { type: String, required: true },
    level: { type: Number, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PermissionSchema.index({ roles: 1 });
PermissionSchema.index({ title: 'text' });

export const PermissionModel = mongoose.model<IPermission>('AclPermissions', PermissionSchema, 'acl_permissions');
