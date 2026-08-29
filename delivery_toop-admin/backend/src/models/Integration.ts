import mongoose, { Schema, Document } from 'mongoose';

export interface IIntegration extends Document {
  company: mongoose.Types.ObjectId;
  system: string;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    system: { type: String, enum: ['JM_Diamante', 'RpInfo', 'Viva_Sistemas'], required: true },
    status: { type: Boolean, default: true, required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

IntegrationSchema.index({ deletedAt: 1 });
IntegrationSchema.index({ company: 1 });

export const IntegrationModel = mongoose.model<IIntegration>('IntIntegrations', IntegrationSchema, 'int_integrations');
