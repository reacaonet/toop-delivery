import mongoose, { Schema, Document } from 'mongoose';

export type MobilityNotificationType = 'ALL' | 'DRIVER' | 'PASSENGER';

export interface IMobilityNotification extends Document {
  franchise: mongoose.Types.ObjectId;
  description: string;
  status: boolean;
  type: MobilityNotificationType;
  expirationDate: Date;
  images: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMobilityNotificationModel extends mongoose.Model<IMobilityNotification> {}

const MobilityNotificationSchema = new Schema<IMobilityNotification, IMobilityNotificationModel>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    description: { type: String, required: true },
    status: { type: Boolean, required: true },
    type: { type: String, enum: ['ALL', 'DRIVER', 'PASSENGER'], default: 'ALL', required: true },
    expirationDate: { type: Date, required: true },
    images: [{ type: String }],
    deletedAt: { type: Date },
  },
  { timestamps: true, collection: 'mobilityNotification' }
);

MobilityNotificationSchema.index({ type: 1 });
MobilityNotificationSchema.index({ status: -1 });
MobilityNotificationSchema.index({ description: 'text' });

export const MobilityNotificationModel = mongoose.model<IMobilityNotification, IMobilityNotificationModel>(
  'MobilityNotification',
  MobilityNotificationSchema,
  'mobilityNotification'
);
