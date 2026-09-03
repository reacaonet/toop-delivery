import mongoose, { Schema, Document } from 'mongoose';

export interface ISite extends Document {
  company: mongoose.Types.ObjectId;
  status?: boolean;
  name?: string;
  domain?: string;
  URLlogo?: string;
  email?: string;
  about?: string;
  slider?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSchema = new Schema<ISite>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    status: { type: Boolean },
    name: { type: String },
    domain: { type: String },
    URLlogo: { type: String },
    email: { type: String },
    about: { type: String },
    slider: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

export const SiteModel = mongoose.model<ISite>('Site', SiteSchema, 'site');
