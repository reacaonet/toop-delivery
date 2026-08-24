import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
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
  owner?: mongoose.Types.ObjectId;
  active: boolean;
  category?: string;
  logo?: string;
  description?: string;
  openingHours?: Record<string, { open: string; close: string }>;
  deliveryFee?: number;
  minimumOrder?: number;
  estimatedDeliveryTime?: number;
  preparationTime?: number;
  rating?: number;
  totalOrders?: number;
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    cnpj: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
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
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    category: { type: String, trim: true },
    logo: { type: String },
    description: { type: String },
    openingHours: { type: Schema.Types.Mixed },
    deliveryFee: { type: Number, default: 0 },
    minimumOrder: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: Number },
    preparationTime: { type: Number, default: 20 },
    rating: { type: Number, min: 0, max: 5 },
    totalOrders: { type: Number, default: 0 },
    images: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CompanySchema.index({ active: 1 });
CompanySchema.index({ cnpj: 1 });
CompanySchema.index({ name: 'text' });

export const CompanyModel = mongoose.model<ICompany>('Company', CompanySchema);
