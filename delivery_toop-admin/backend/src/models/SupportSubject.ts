import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportSubject extends Document {
  franchise: mongoose.Types.ObjectId;
  subject: string;
  status: boolean;
  type: 'PASSENGER' | 'DRIVER';
  target: 'CANCEL' | 'SUPPORT';
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportSubjectSchema = new Schema<ISupportSubject>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    subject: { type: String, required: true },
    status: { type: Boolean, required: true },
    type: { type: String, enum: ['PASSENGER', 'DRIVER'], default: 'PASSENGER', required: true },
    target: { type: String, enum: ['CANCEL', 'SUPPORT'], default: 'CANCEL', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SupportSubjectSchema.index({ type: 1 });
SupportSubjectSchema.index({ franchise: -1 });
SupportSubjectSchema.index({ status: -1 });
SupportSubjectSchema.index({ subject: 'text' });
SupportSubjectSchema.index({ subject: -1 });
SupportSubjectSchema.index({ createdAt: 1 });
SupportSubjectSchema.index({ deletedAt: 1 });
SupportSubjectSchema.index({ target: -1 });

export const SupportSubjectModel = mongoose.model<ISupportSubject>('SupportSubject', SupportSubjectSchema, 'supportSubject');
