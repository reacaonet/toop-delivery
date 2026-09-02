import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryAddress extends Document {
  name?: string;
  address?: string;
  location: { type: string; coordinates: number[] };
  main: boolean;
  number?: number;
  complement?: string;
  customer: mongoose.Types.ObjectId;
  referencePoint?: string;
  category?: 'RESIDENCIA' | 'HOME' | 'WORK';
  addressRoute?: string;
  addressRegion?: string;
  city?: string;
  district?: string;
  streetNumber?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point', required: true },
  coordinates: { type: [Number], required: true },
});

const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    name: { type: String },
    address: { type: String },
    location: { type: PointSchema, index: '2dsphere', required: true },
    main: { type: Boolean, default: false, required: true },
    number: { type: Number },
    complement: { type: String },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referencePoint: { type: String },
    category: { type: String, enum: ['RESIDENCIA', 'HOME', 'WORK'] },
    addressRoute: { type: String },
    addressRegion: { type: String },
    city: { type: String },
    district: { type: String },
    streetNumber: { type: String },
    state: { type: String },
    country: { type: String },
    zipcode: { type: String },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const { __v: _v, ...rest } = ret;
        return rest;
      },
    },
  }
);

DeliveryAddressSchema.index({ customer: 1 });
DeliveryAddressSchema.index({ main: 1 });
DeliveryAddressSchema.index({ isDeleted: 1 });

export const DeliveryAddressModel = mongoose.model<IDeliveryAddress>(
  'CustomerDeliveryAddress',
  DeliveryAddressSchema,
  'customer_delivery_address'
);