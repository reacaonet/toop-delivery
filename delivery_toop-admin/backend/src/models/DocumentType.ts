import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentType extends Document {
  name: string;
  status: boolean;
  type: 'VEHICLE' | 'DRIVER';
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentTypeSchema = new Schema<IDocumentType>(
  {
    name: { type: String, required: true },
    status: { type: Boolean, required: true },
    type: { type: String, enum: ['VEHICLE', 'DRIVER'], default: 'DRIVER', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

DocumentTypeSchema.index({ type: 1 });
DocumentTypeSchema.index({ status: -1 });
DocumentTypeSchema.index({ name: 'text' });
DocumentTypeSchema.index({ name: -1 });

export const DocumentTypeModel = mongoose.model<IDocumentType>('DocumentType', DocumentTypeSchema, 'documentType');
