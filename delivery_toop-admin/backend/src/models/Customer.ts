import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  iugu_id?: string;
  email?: string;
  ddi?: string;
  phone?: string;
  person: mongoose.Types.ObjectId;
  device?: string;
  instanceIdToken?: string;
  token?: string;
  favoriteRestaurants?: any[];
  favoriteSupermarkets?: any[];
  termsNotAccepted: boolean;
  sku?: string;
  appVersion?: string;
  deletedAt?: Date;
  rating?: {
    stars: number;
    comment: string;
    dateRating: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    iugu_id: { type: String, required: false },
    email: { type: String, required: false },
    ddi: { type: String, default: '+55', required: false },
    phone: { type: String, required: false },
    person: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    device: { type: String, required: false },
    instanceIdToken: { type: String, required: false },
    token: { type: String, required: false },
    favoriteRestaurants: { type: Array, required: false },
    favoriteSupermarkets: { type: Array, required: false },
    termsNotAccepted: { type: Boolean, required: true, default: true },
    sku: { type: String, required: false },
    appVersion: { type: String, required: false },
    deletedAt: { type: Date, required: false },
    rating: {
      stars: { type: Number },
      comment: { type: String },
      dateRating: { type: Date },
    },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CustomerSchema.index({ phone: -1 });
CustomerSchema.index({ email: -1 });
CustomerSchema.index({ person: -1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ updatedAt: -1 });
CustomerSchema.index({ token: -1 });

export const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema, 'customer');