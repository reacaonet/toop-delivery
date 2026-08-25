import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  company: mongoose.Types.ObjectId;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  };
  phone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    address: {
      street: String,
      number: String,
      complement: String,
      neighborhood: String,
      city: String,
      state: String,
      zipCode: String,
      lat: Number,
      lng: Number,
    },
    phone: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BranchSchema.index({ company: 1, active: 1 });

export default mongoose.model<IBranch>('Branch', BranchSchema);
