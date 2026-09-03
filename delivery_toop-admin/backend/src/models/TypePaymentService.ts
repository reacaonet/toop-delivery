import mongoose, { Schema, Document } from 'mongoose';

export type TypePaymentServiceType = 'MONEY' | 'CARD' | 'BRASPAG' | 'PAGARME' | 'PIX' | 'ALL';
export type TypePaymentServiceGenre = 'H' | 'M';

export interface ITypePaymentService extends Document {
  service?: mongoose.Types.ObjectId;
  name: string;
  type?: TypePaymentServiceType;
  genre?: TypePaymentServiceGenre;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITypePaymentServiceModel extends mongoose.Model<ITypePaymentService> {}

const TypePaymentServiceSchema = new Schema<ITypePaymentService, ITypePaymentServiceModel>(
  {
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: false },
    name: { type: String, required: true },
    type: { type: String, enum: ['MONEY', 'CARD', 'BRASPAG', 'PAGARME', 'PIX', 'ALL'], required: false },
    genre: { type: String, enum: ['H', 'M'], required: false },
    status: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);

TypePaymentServiceSchema.index({ service: -1 });
TypePaymentServiceSchema.index({ genre: -1 });
TypePaymentServiceSchema.index({ status: -1 });

export const TypePaymentServiceModel = mongoose.model<ITypePaymentService, ITypePaymentServiceModel>(
  'TypePaymentService',
  TypePaymentServiceSchema,
  'typePaymentService'
);
