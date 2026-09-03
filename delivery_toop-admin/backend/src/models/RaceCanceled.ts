import mongoose, { Schema, Document } from 'mongoose';

export interface IRaceCanceled extends Document {
  deliveryMan: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RaceCanceledSchema = new Schema<IRaceCanceled>(
  {
    deliveryMan: { type: Schema.Types.ObjectId, ref: 'Deliveryman', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

RaceCanceledSchema.index({ order: 1 });

export const RaceCanceledModel = mongoose.model<IRaceCanceled>(
  'RaceCanceled',
  RaceCanceledSchema,
  'raceCanceled'
);
