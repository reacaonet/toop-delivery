import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'users' | 'deliverymen' | 'companies';
  targetId?: mongoose.Types.ObjectId;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    target: { type: String, enum: ['all', 'users', 'deliverymen', 'companies'], default: 'all' },
    targetId: { type: Schema.Types.ObjectId },
    read: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

NotificationSchema.index({ target: 1 });
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
