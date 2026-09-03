import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyDistance {
  min: number;
  max: number;
  price: number;
  delivery_time: number;
}

export interface ICompanyDelivery extends Document {
  isOpen: boolean;
  isManual: boolean;
  company: mongoose.Types.ObjectId;
  typePayments: mongoose.Types.ObjectId[];
  mdr: number;
  fee: number;
  distance: ICompanyDistance[];
  max_distance: number;
  max_distance_withdraw: number;
  min_purchase: number;
  max_amount_items: number;
  time_to_call_delivery: number;
  own_delivery: boolean;
  online_delivery: boolean;
  has_split: boolean;
  withdrawMarket: boolean;
  mediaRating?: number;
  totalRating?: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyDistanceSchema = new Schema<ICompanyDistance>(
  {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    delivery_time: { type: Number, default: 0 },
  },
  { _id: false }
);

const CompanyDeliverySchema = new Schema<ICompanyDelivery>(
  {
    isOpen: { type: Boolean, required: true, default: false },
    isManual: { type: Boolean, required: true, default: false },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    typePayments: { type: [Schema.Types.ObjectId], ref: 'FncTypePayments', default: [] },
    mdr: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    distance: { type: [CompanyDistanceSchema], default: [] },
    max_distance: { type: Number, default: 10000 },
    max_distance_withdraw: { type: Number, default: 10000 },
    min_purchase: { type: Number, default: 0 },
    max_amount_items: { type: Number, default: 0 },
    time_to_call_delivery: { type: Number, default: 0 },
    own_delivery: { type: Boolean, default: false },
    online_delivery: { type: Boolean, default: true },
    has_split: { type: Boolean, default: false },
    withdrawMarket: { type: Boolean, default: false },
    mediaRating: { type: Number },
    totalRating: { type: Number, default: 0 },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CompanyDeliverySchema.index({ company: -1 });
CompanyDeliverySchema.index({ deletedAt: 1 });

export const CompanyDeliveryModel = mongoose.model<ICompanyDelivery>(
  'CompanyDelivery',
  CompanyDeliverySchema,
  'company_delivery'
);
