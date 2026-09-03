import mongoose, { Schema, Document } from 'mongoose';

export type ServiceType =
  | 'bike'
  | 'motorcycle'
  | 'car'
  | 'microbus'
  | 'bus'
  | 'truck'
  | 'package';

export interface IServiceDistance {
  min: number;
  max: number;
  priceMinute: number;
  priceKM: number;
}

export interface IServicePeakHour {
  _id: mongoose.Types.ObjectId;
  percent: number;
}

export interface IService extends Document {
  name: string;
  franchise: mongoose.Types.ObjectId;
  capacity: number;
  priceCalculation?: mongoose.Types.ObjectId;
  minimumRate?: number;
  hourlyPrice?: number;
  basePrice?: number;
  valueByPercentage: number;
  fixedValue: number;
  baseDistance?: number;
  radiusSendRace: number;
  timePrice?: number;
  currencyPrice?: number;
  dispensingMinutes?: number;
  ratePerMinute?: number;
  peakHours: IServicePeakHour[];
  status: boolean;
  onlyForWomen: boolean;
  requireConfirmationCode: boolean;
  images: string[];
  makers: string[];
  timeZone: string;
  utc: number;
  distance: IServiceDistance[];
  showArrivalTime: boolean;
  type: ServiceType;
  info?: string;
  useDynamicsRace: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceDistanceSchema = new Schema<IServiceDistance>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    priceMinute: { type: Number, required: true },
    priceKM: { type: Number, required: true },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    capacity: { type: Number, required: true },
    priceCalculation: { type: Schema.Types.ObjectId, ref: 'priceCalculations' },
    minimumRate: { type: Number },
    hourlyPrice: { type: Number },
    basePrice: { type: Number },
    valueByPercentage: { type: Number, min: 0, default: 0 },
    fixedValue: { type: Number, min: 0, default: 0 },
    baseDistance: { type: Number },
    radiusSendRace: { type: Number, default: 8, required: true },
    timePrice: { type: Number },
    currencyPrice: { type: Number },
    dispensingMinutes: { type: Number },
    ratePerMinute: { type: Number },
    peakHours: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'PeakHour' },
        percent: { type: Number },
      },
    ],
    status: { type: Boolean, default: true },
    onlyForWomen: { type: Boolean, default: false },
    requireConfirmationCode: { type: Boolean, default: false, required: true },
    images: [{ type: String }],
    makers: [{ type: String }],
    timeZone: { type: String, default: 'America/Sao_Paulo' },
    utc: { type: Number, default: -3, min: -13, max: 15 },
    distance: { type: [ServiceDistanceSchema] },
    showArrivalTime: { type: Boolean, default: true, required: true },
    type: {
      type: String,
      required: true,
      default: 'car',
      enum: ['bike', 'motorcycle', 'car', 'microbus', 'bus', 'truck', 'package'],
    },
    info: { type: String },
    useDynamicsRace: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } },
  }
);

ServiceSchema.index({ type: 1 });
ServiceSchema.index({ type: -1 });
ServiceSchema.index({ status: -1 });
ServiceSchema.index({ franchise: -1 });
ServiceSchema.index({ onlyForWomen: -1 });
ServiceSchema.index({ deletedAt: 1 });
ServiceSchema.index({ name: 'text' });
ServiceSchema.index({ name: -1 });

export const ServiceModel = mongoose.model<IService>('Service', ServiceSchema, 'service');
