import mongoose, { Schema, Document } from 'mongoose';

export enum QueueStatus {
  WAIT = 'WAIT',
  PROCESS = 'PROCESS',
  FINISH = 'FINISH',
  NOT_FOUND_DELIVERYMAN = 'NOT_FOUND_DELIVERYMAN',
}

export interface IQueueDeliveryMan extends Document {
  company: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  locationCompany?: {
    type: 'Point';
    coordinates: [number, number];
  };
  attempt: number;
  deliveryMan?: mongoose.Types.ObjectId;
  lastData?: Date;
  historicDeliveryMan: mongoose.Types.ObjectId[];
  deliveryManProcess: mongoose.Types.ObjectId[];
  status: QueueStatus;
  statusProcess?: 'IN_QUEUE' | 'FINISH';
  sendToDeliveryMan?: string;
  sendToListDeliveryMan?: mongoose.Types.ObjectId[];
  typeOfVehicle?: string;
  notificationReceived: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const QueueDeliveryManSchema = new Schema<IQueueDeliveryMan>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    locationCompany: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    attempt: { type: Number, default: 0, required: true },
    deliveryMan: { type: Schema.Types.ObjectId, ref: 'Deliveryman' },
    lastData: { type: Date },
    historicDeliveryMan: { type: [Schema.Types.ObjectId], default: [], required: true },
    deliveryManProcess: { type: [Schema.Types.ObjectId], default: [], required: true },
    status: {
      type: String,
      enum: Object.values(QueueStatus),
      default: QueueStatus.WAIT,
      required: true,
    },
    statusProcess: { type: String, enum: ['IN_QUEUE', 'FINISH'] },
    sendToDeliveryMan: { type: String },
    sendToListDeliveryMan: [{ type: Schema.Types.ObjectId, ref: 'Deliveryman' }],
    typeOfVehicle: { type: String },
    notificationReceived: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

QueueDeliveryManSchema.index({ attempt: 1 });
QueueDeliveryManSchema.index({ lastData: 1 });
QueueDeliveryManSchema.index({ status: 1 });
QueueDeliveryManSchema.index({ order: -1 });

export const QueueDeliveryManModel = mongoose.model<IQueueDeliveryMan>(
  'QueueDeliveryMan',
  QueueDeliveryManSchema,
  'queueDeliveryMan'
);
