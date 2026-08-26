import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingNumber: string;
  client: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  driverModel?: 'Driver' | 'Deliveryman';
  company: mongoose.Types.ObjectId;
  serviceCategory: 'driver' | 'delivery' | 'package';
  status: 'pending' | 'matching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickup: {
    address: string;
    lat: number;
    lng: number;
    complement?: string;
  };
  dropoff: {
    address: string;
    lat: number;
    lng: number;
    complement?: string;
  };
  distance?: number;
  duration?: number;
  estimatedPrice?: number;
  finalPrice?: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  rating?: {
    client?: number;
    driver?: number;
    clientComment?: string;
    driverComment?: string;
  };
  cancelReason?: string;
  cancelledBy?: 'client' | 'driver' | 'system';
  cancelFee?: number;
  rejectedDrivers?: mongoose.Types.ObjectId[];
  qrCode?: string;
  qrCodeVerified?: boolean;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: Schema.Types.ObjectId, refPath: 'driverModel' },
    driverModel: { type: String, enum: ['Driver', 'Deliveryman'], default: 'Driver' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    serviceCategory: { type: String, enum: ['driver', 'delivery', 'package'], default: 'driver' },
    status: {
      type: String,
      enum: ['pending', 'matching', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      complement: String,
    },
    dropoff: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      complement: String,
    },
    distance: Number,
    duration: Number,
    estimatedPrice: Number,
    finalPrice: Number,
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    notes: String,
    rating: {
      client: { type: Number, min: 1, max: 5 },
      driver: { type: Number, min: 1, max: 5 },
      clientComment: String,
      driverComment: String,
    },
    cancelReason: String,
    cancelledBy: { type: String, enum: ['client', 'driver', 'system'] },
    cancelFee: { type: Number, default: 0 },
    rejectedDrivers: [{ type: Schema.Types.ObjectId, refPath: 'driverModel' }],
    qrCode: String,
    qrCodeVerified: { type: Boolean, default: false },
    scheduledAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

BookingSchema.index({ status: 1 });
BookingSchema.index({ client: 1 });
BookingSchema.index({ driver: 1 });
BookingSchema.index({ company: 1 });
BookingSchema.index({ createdAt: -1 });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
