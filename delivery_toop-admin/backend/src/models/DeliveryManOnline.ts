import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryManOnline extends Document {
  deliveryMan: mongoose.Types.ObjectId;
  online: Date;
  offline?: Date;
  total?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryManOnlineSchema = new Schema<IDeliveryManOnline>(
  {
    deliveryMan: { type: Schema.Types.ObjectId, ref: 'Deliveryman', required: true },
    online: { type: Date, required: true },
    offline: { type: Date },
    total: { type: Number },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

DeliveryManOnlineSchema.index({ deliveryMan: 1, online: -1 });

export const DeliveryManOnlineModel = mongoose.model<IDeliveryManOnline>(
  'DeliveryManOnline',
  DeliveryManOnlineSchema,
  'deliveryManOnline'
);
