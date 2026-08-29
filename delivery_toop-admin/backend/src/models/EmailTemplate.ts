import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
  company?: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  type: mongoose.Types.ObjectId;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: 'EmailType', required: true },
    status: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

EmailTemplateSchema.index({ deletedAt: 1 });
EmailTemplateSchema.index({ type: 1, company: 1 });

export const EmailTemplateModel = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
