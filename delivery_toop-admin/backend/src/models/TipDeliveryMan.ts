import mongoose, { Schema, Document } from 'mongoose';

export interface ITipDeliveryMan extends Document {
  orderStatus: mongoose.Types.ObjectId;
  deliveryMan: mongoose.Types.ObjectId;
  tip?: mongoose.Types.ObjectId;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

const TipDeliveryManSchema = new Schema<ITipDeliveryMan>(
  {
    orderStatus: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryMan: { type: Schema.Types.ObjectId, ref: 'Deliveryman', required: true },
    tip: { type: Schema.Types.ObjectId, ref: 'Tip' },
    value: { type: Number, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

TipDeliveryManSchema.index({ deliveryMan: 1, createdAt: -1 });

export const TipDeliveryManModel = mongoose.model<ITipDeliveryMan>(
  'TipDeliveryMan',
  TipDeliveryManSchema,
  'tipDeliveryMan'
);
