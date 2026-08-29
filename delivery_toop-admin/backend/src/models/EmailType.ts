import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailType extends Document {
  key: string;
  name: string;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTypeSchema = new Schema<IEmailType>(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    status: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

EmailTypeSchema.index({ deletedAt: 1 });

export const EmailTypeModel = mongoose.model<IEmailType>('EmailType', EmailTypeSchema);
