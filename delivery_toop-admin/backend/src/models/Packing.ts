import mongoose, { Schema, Document } from 'mongoose';

export interface IPacking extends Document {
  name: string;
  status?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PackingSchema = new Schema<IPacking>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: Boolean },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PackingSchema.index({ deletedAt: 1 });

export const PackingModel = mongoose.model<IPacking>('Packing', PackingSchema, 'packing');
