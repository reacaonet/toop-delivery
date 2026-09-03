import { Schema, model, Document } from 'mongoose';

export interface ITwilio extends Document {
  name: string;
  email: string;
  phone: string;
  note?: string;
  active: boolean;
}

const twilioSchema = new Schema<ITwilio>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, required: false },
    active: { type: Boolean, default: false, required: true },
  },
  { timestamps: true, collection: 'twilio' }
);

export const TwilioModel = model<ITwilio>('Twilio', twilioSchema, 'twilio');
export default TwilioModel;
