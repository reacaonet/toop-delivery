import mongoose, { Schema, Document } from 'mongoose';

export interface ITravelBookingInfo extends Document {
  franchise?: mongoose.Types.ObjectId;
  service?: mongoose.Types.ObjectId;
  passenger?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  polylineStart: string;
  polylineEnd?: string;
  imageStart?: string;
  imageEnd?: string;
  predictedDistance?: number;
  predictedTime?: number;
  predictedPrice?: number;
  servicesCalculationBasis?: any[];
  travelledDistance?: number;
  travelledTime?: number;
  travelledPrice?: number;
  travelledCalculationBasis?: any;
  status: 'search' | 'travelRequest' | 'concluded';
  createdAt: Date;
  updatedAt: Date;
}

const TravelBookingInfoSchema = new Schema<ITravelBookingInfo>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    passenger: { type: Schema.Types.ObjectId, ref: 'Passenger' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    polylineStart: { type: String, required: true },
    polylineEnd: { type: String },
    imageStart: { type: String },
    imageEnd: { type: String },
    predictedDistance: { type: Number },
    predictedTime: { type: Number },
    predictedPrice: { type: Number },
    servicesCalculationBasis: { type: [Schema.Types.Mixed], default: [] },
    travelledDistance: { type: Number },
    travelledTime: { type: Number },
    travelledPrice: { type: Number },
    travelledCalculationBasis: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['search', 'travelRequest', 'concluded'], default: 'search', required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

TravelBookingInfoSchema.index({ franchise: -1 });
TravelBookingInfoSchema.index({ service: -1 });
TravelBookingInfoSchema.index({ passenger: -1 });
TravelBookingInfoSchema.index({ booking: -1 });
TravelBookingInfoSchema.index({ driver: -1 });
TravelBookingInfoSchema.index({ createdAt: -1 });

export const TravelBookingInfoModel = mongoose.model<ITravelBookingInfo>('travelBookingInfo', TravelBookingInfoSchema, 'travelBookingInfo');
