import mongoose, { Schema, Document } from 'mongoose';

export interface IHelpTicket extends Document {
  tickedId: string;
  subject?: string;
  description?: string;
  person?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  department: 'ADMINISTRATIVE' | 'COMMERCIAL' | 'MARKETING' | 'FINANCIAL' | 'SUPPORT' | 'TI';
  status: 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'SOLVED';
  name?: string;
  email?: string;
  phone?: number;
  order?: mongoose.Types.ObjectId;
  images: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HelpTicketSchema = new Schema<IHelpTicket>(
  {
    tickedId: { type: String, required: true, unique: true, trim: true },
    subject: { type: String },
    description: { type: String },
    person: { type: Schema.Types.ObjectId, ref: 'User' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    department: {
      type: String,
      enum: ['ADMINISTRATIVE', 'COMMERCIAL', 'MARKETING', 'FINANCIAL', 'SUPPORT', 'TI'],
      default: 'SUPPORT',
    },
    status: { type: String, enum: ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'SOLVED'], default: 'NEW' },
    name: { type: String },
    email: { type: String },
    phone: { type: Number },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    images: { type: [String], default: [] },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

HelpTicketSchema.index({ company: 1, createdAt: -1 });
HelpTicketSchema.index({ status: 1 });

export const HelpTicketModel = mongoose.model<IHelpTicket>('HelpTicket', HelpTicketSchema);
