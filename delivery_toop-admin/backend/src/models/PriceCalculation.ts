import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceCalculation extends Document {
  name: string;
  info: string;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPriceCalculationModel extends mongoose.Model<IPriceCalculation> {}

const PriceCalculationSchema = new Schema<IPriceCalculation, IPriceCalculationModel>(
  {
    name: { type: String, required: true },
    info: { type: String, required: true },
    status: { type: Boolean, required: true, default: true },
    deletedAt: { type: Date, required: false },
  },
  { timestamps: true, collection: 'priceCalculation' }
);

PriceCalculationSchema.index({ status: -1 });
PriceCalculationSchema.index({ name: 'text' });
PriceCalculationSchema.index({ name: -1 });

export const PriceCalculationModel = mongoose.model<IPriceCalculation, IPriceCalculationModel>(
  'PriceCalculation',
  PriceCalculationSchema,
  'priceCalculation'
);
