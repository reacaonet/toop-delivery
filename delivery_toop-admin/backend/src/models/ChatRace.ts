import mongoose, { Schema, Document } from 'mongoose';

export type ChatRaceMessageType = 'text' | 'audio' | 'image' | 'text_alert';
export type ChatRaceParticipant = 'driver' | 'passenger';

export interface IChatRace extends Document {
  message: string;
  type: ChatRaceMessageType;
  booking: mongoose.Types.ObjectId;
  sent: ChatRaceParticipant;
  receive: ChatRaceParticipant;
  driver: mongoose.Types.ObjectId;
  passenger: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatRaceModel extends mongoose.Model<IChatRace> {}

const ChatRaceSchema = new Schema<IChatRace, IChatRaceModel>(
  {
    message: { type: String, required: true },
    type: { type: String, enum: ['text', 'audio', 'image', 'text_alert'], default: 'text', required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    sent: { type: String, enum: ['driver', 'passenger'], required: true },
    receive: { type: String, enum: ['driver', 'passenger'], required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
  },
  { timestamps: true }
);

export const ChatRaceModel = mongoose.model<IChatRace, IChatRaceModel>(
  'ChatRace',
  ChatRaceSchema,
  'chatRace'
);
