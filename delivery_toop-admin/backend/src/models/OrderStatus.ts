import mongoose, { Schema, Document } from 'mongoose';

const ORDER_STATUS_LIST = [
  'WAIT_COMPANY',
  'ACCEPTED',
  'REFUSED',
  'CONFIRMED',
  'IN_PREPARATION',
  'WAIT_DELIVERYMAN',
  'DELIVERYMAN_BUSY',
  'DELIVERYMAN_ARRIVED',
  'DELIVERING',
  'PAYMENT_REFUSED',
  'WAIT_PAYMENT',
  'PAYMENT_APPROVED',
  'FINISHED',
  'CANCELED',
] as const;

export interface IOrderStatus extends Document {
  order: mongoose.Types.ObjectId;
  orderNumber: string;
  status: (typeof ORDER_STATUS_LIST)[number];
  payment?: mongoose.Types.ObjectId[];
  typePayment?: string;
  typeSchedule?: string;
  deliveryman?: mongoose.Types.ObjectId;
  shopper?: mongoose.Types.ObjectId;
  franchise?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderStatusSchema = new Schema<IOrderStatus>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: ORDER_STATUS_LIST, required: true },
    payment: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    typePayment: { type: String },
    typeSchedule: { type: String },
    deliveryman: { type: Schema.Types.ObjectId, ref: 'Deliveryman' },
    shopper: { type: Schema.Types.ObjectId, ref: 'Shopper' },
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
  },
  { timestamps: true, collection: 'orderStatus' }
);

OrderStatusSchema.index({ order: 1 });
OrderStatusSchema.index({ orderNumber: 1 });
OrderStatusSchema.index({ status: 1, createdAt: -1 });

export const OrderStatusModel = mongoose.model<IOrderStatus>(
  'OrderStatus',
  OrderStatusSchema,
  'orderStatus'
);