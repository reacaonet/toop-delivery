import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketInteraction extends Document {
  helpTicketsId: mongoose.Types.ObjectId;
  description: string;
  origin: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketInteractionSchema = new Schema<ITicketInteraction>(
  {
    helpTicketsId: { type: Schema.Types.ObjectId, ref: 'HelpTicket', required: true },
    description: { type: String, required: true },
    origin: { type: String, required: true },
    author: { type: String },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

TicketInteractionSchema.index({ helpTicketsId: 1, createdAt: -1 });

export const TicketInteractionModel = mongoose.model<ITicketInteraction>('TicketInteraction', TicketInteractionSchema);
