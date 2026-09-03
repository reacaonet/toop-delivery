import mongoose, { Schema, Document } from 'mongoose';

export type PushNotificationStatus = 'wait' | 'success' | 'error';

export interface IPushNotification extends Document {
  franchise: mongoose.Types.ObjectId;
  topic?: string;
  user?: any;
  title: string;
  message: string;
  status: PushNotificationStatus;
  errMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPushNotificationModel extends mongoose.Model<IPushNotification> {}

const PushNotificationSchema = new Schema<IPushNotification, IPushNotificationModel>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    topic: { type: String, required: false },
    user: { type: Schema.Types.Array, required: false },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['wait', 'success', 'error'], default: 'wait', required: false },
    errMessage: { type: String, required: false },
  },
  { timestamps: true }
);

PushNotificationSchema.index({ franchise: -1 });
PushNotificationSchema.index({ topic: -1 });
PushNotificationSchema.index({ createdAt: -1 });

export const PushNotificationModel = mongoose.model<IPushNotification, IPushNotificationModel>(
  'PushNotification',
  PushNotificationSchema,
  'pushNotification'
);
