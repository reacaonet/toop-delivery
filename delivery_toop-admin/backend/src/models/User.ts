import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'manager' | 'operator' | 'deliveryman' | 'customer';
  active: boolean;
  company?: mongoose.Types.ObjectId;
  deliveryman?: mongoose.Types.ObjectId;
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'manager', 'operator', 'deliveryman', 'customer'], default: 'operator' },
    active: { type: Boolean, default: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    deliveryman: { type: Schema.Types.ObjectId, ref: 'Deliveryman' },
    avatar: { type: String },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const { password: _p, __v: _v, ...rest } = ret;
        return rest;
      },
    },
  }
);

UserSchema.index({ active: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
