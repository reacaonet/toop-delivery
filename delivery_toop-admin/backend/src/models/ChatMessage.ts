import mongoose, { Schema, Document } from 'mongoose';

export enum ChatPersonType {
  CUSTOMER = 'customer',
  SHOPPER = 'shopper',
  DELIVERY_MAN = 'deliveryMan',
}

export enum ChatMessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
  TEXT_ALERT = 'text_alert',
}

export interface IChatMessage extends Document {
  message: string;
  type: ChatMessageType;
  dataType?: string;
  urlFile?: string;
  shoppingCart: mongoose.Types.ObjectId;
  person: ChatPersonType;
  personId: mongoose.Types.ObjectId;
  personSend: ChatPersonType;
  personSendId: mongoose.Types.ObjectId;
  flag?: string;
  read: boolean;
  readSend: boolean;
  order_number?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    message: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(ChatMessageType),
      default: ChatMessageType.TEXT,
      required: true,
    },
    dataType: { type: String },
    urlFile: { type: String },
    shoppingCart: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    person: { type: String, enum: Object.values(ChatPersonType), required: true },
    personId: { type: Schema.Types.ObjectId, required: true },
    personSend: { type: String, enum: Object.values(ChatPersonType), required: true },
    personSendId: { type: Schema.Types.ObjectId, required: true },
    flag: { type: String },
    read: { type: Boolean, default: false, required: true },
    readSend: { type: Boolean, default: false, required: true },
    order_number: { type: Number },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

ChatMessageSchema.index({
  shoppingCart: 1,
  person: 1,
  personId: 1,
  personSend: 1,
  personSendId: 1,
  read: 1,
});

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema, 'chatMessage');
