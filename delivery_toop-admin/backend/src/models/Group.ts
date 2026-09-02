import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  franchise?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: boolean;
  deletedAt?: Date;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: Boolean, required: true, default: false },
    deletedAt: { type: Date },
    images: [{ type: String }],
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

GroupSchema.index({ name: 'text' });
GroupSchema.index({ name: -1 });
GroupSchema.index({ deletedAt: 1 });

export const GroupModel = mongoose.model<IGroup>('Group', GroupSchema, 'group');
