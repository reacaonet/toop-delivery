import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryman extends Document {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  cnh?: string;
  vehicleType: 'bike' | 'motorcycle' | 'car' | 'van';
  vehiclePlate?: string;
  active: boolean;
  available: boolean;
  currentLocation?: { lat: number; lng: number };
  rating?: number;
  totalDeliveries: number;
  avatar?: string;
  documents?: {
    cnh?: string;
    vehicleDocument?: string;
    photo?: string;
  };
  documentStatus?: {
    cnh: 'pending' | 'approved' | 'rejected';
    vehicleDocument: 'pending' | 'approved' | 'rejected';
    photo: 'pending' | 'approved' | 'rejected';
  };
  createdAt: Date;
  updatedAt: Date;
}

const DeliverymanSchema = new Schema<IDeliveryman>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cpf: { type: String, trim: true },
    cnh: { type: String, trim: true },
    vehicleType: { type: String, enum: ['bike', 'motorcycle', 'car', 'van'], default: 'motorcycle' },
    vehiclePlate: { type: String, trim: true },
    active: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    rating: { type: Number, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    avatar: { type: String },
    documents: {
      cnh: String,
      vehicleDocument: String,
      photo: String,
    },
    documentStatus: {
      cnh: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      vehicleDocument: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      photo: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

DeliverymanSchema.index({ active: 1 });
DeliverymanSchema.index({ available: 1 });
DeliverymanSchema.index({ 'currentLocation': '2dsphere' });

export const DeliverymanModel = mongoose.model<IDeliveryman>('Deliveryman', DeliverymanSchema);
