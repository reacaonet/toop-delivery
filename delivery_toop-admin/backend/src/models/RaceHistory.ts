import mongoose, { Schema, Document } from 'mongoose';

export enum RaceStatus {
  ACCEPTED = 'ACCEPTED',
  REFUSED = 'REFUSED',
  CANCELED = 'CANCELED',
}

export interface IRaceHistory extends Document {
  deliveryMan: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  companyName: string;
  companyAddress?: string;
  payment?: mongoose.Types.ObjectId;
  paymentPriceDelivery?: number;
  distanceToCompany?: number;
  distanceTotal?: number;
  statusRace: RaceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RaceHistorySchema = new Schema<IRaceHistory>(
  {
    deliveryMan: { type: Schema.Types.ObjectId, ref: 'Deliveryman', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    company: { type: Schema.Types.ObjectId, required: true },
    companyName: { type: String, required: true },
    companyAddress: { type: String },
    payment: { type: Schema.Types.ObjectId },
    paymentPriceDelivery: { type: Number },
    distanceToCompany: { type: Number },
    distanceTotal: { type: Number },
    statusRace: { type: String, enum: Object.values(RaceStatus), required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

RaceHistorySchema.index({ deliveryMan: 1, createdAt: -1 });
RaceHistorySchema.index({ order: 1 });

export const RaceHistoryModel = mongoose.model<IRaceHistory>(
  'RaceHistory',
  RaceHistorySchema,
  'raceHistory'
);
