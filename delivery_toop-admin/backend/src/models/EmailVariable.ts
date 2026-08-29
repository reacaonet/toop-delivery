import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailVariable extends Document {
  name: string;
  title: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailVariableSchema = new Schema<IEmailVariable>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

EmailVariableSchema.index({ deletedAt: 1 });

export const EmailVariableModel = mongoose.model<IEmailVariable>('EmailVariable', EmailVariableSchema);
