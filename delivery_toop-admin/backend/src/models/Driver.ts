import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  vehicleType: 'bike' | 'motorcycle' | 'car' | 'van';
  vehiclePlate?: string;
  serviceCategories: ('driver' | 'delivery' | 'package')[];
  active: boolean;
  available: boolean;
  online: boolean;
  currentLocation?: {
    type: string;
    coordinates: number[];
  };
  heading?: number;
  speed?: number;
  lastLocationUpdate?: Date;
  rating?: number;
  totalTrips: number;
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
  company?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cpf: { type: String, trim: true },
    vehicleType: { type: String, enum: ['bike', 'motorcycle', 'car', 'van'], default: 'motorcycle' },
    vehiclePlate: { type: String, trim: true },
    serviceCategories: [{ type: String, enum: ['driver', 'delivery', 'package'], default: ['driver'] }],
    active: { type: Boolean, default: true },
    available: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    heading: { type: Number },
    speed: { type: Number },
    lastLocationUpdate: { type: Date },
    rating: { type: Number, min: 0, max: 5, default: 5 },
    totalTrips: { type: Number, default: 0 },
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
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

DriverSchema.index({ active: 1 });
DriverSchema.index({ available: 1 });
DriverSchema.index({ online: 1 });
DriverSchema.index({ currentLocation: '2dsphere' });
DriverSchema.index({ serviceCategories: 1 });

export const DriverModel = mongoose.model<IDriver>('Driver', DriverSchema);
