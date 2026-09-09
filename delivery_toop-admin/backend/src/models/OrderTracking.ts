import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderTracking extends Document {
  order: mongoose.Types.ObjectId;
  shopper?: mongoose.Types.ObjectId;
  deliveryman?: mongoose.Types.ObjectId;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderTrackingSchema = new Schema<IOrderTracking>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    shopper: { type: Schema.Types.ObjectId, ref: 'Shopper' },
    deliveryman: { type: Schema.Types.ObjectId, ref: 'Deliveryman' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true, default: [0, 0] },
    },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true, collection: 'orderTracking' }
);

OrderTrackingSchema.index({ order: 1 });
OrderTrackingSchema.index({ location: '2dsphere' });

export const OrderTrackingModel = mongoose.model<IOrderTracking>(
  'OrderTracking',
  OrderTrackingSchema,
  'orderTracking'
);