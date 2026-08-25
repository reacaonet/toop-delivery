import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  booking: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderModel: 'User' | 'Driver';
  content: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    sender: { type: Schema.Types.ObjectId, refPath: 'senderModel', required: true },
    senderModel: { type: String, required: true, enum: ['User', 'Driver'] },
    content: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

MessageSchema.index({ booking: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
