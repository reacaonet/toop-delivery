import mongoose, { Schema, Document } from 'mongoose';

export enum RegisterDeliveryStatus {
  PENDING = 'PENDING',
  ANALYZE = 'ANALYZE',
  DECLINED = 'DECLINED',
  APPROVED = 'APPROVED',
}

export interface IRegisterDeliveryMan extends Document {
  name: string;
  cpf: string;
  celphone: string;
  email: string;
  city: string;
  state: string;
  state_id?: mongoose.Types.ObjectId;
  city_id?: mongoose.Types.ObjectId;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'BIKE';
  status: RegisterDeliveryStatus;
  imageSelfie: string[];
  imagesCnh?: string[];
  imagesDocuments?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegisterDeliveryManSchema = new Schema<IRegisterDeliveryMan>(
  {
    name: { type: String, required: true },
    cpf: { type: String, required: true },
    celphone: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    state_id: { type: Schema.Types.ObjectId, ref: 'SettingState' },
    city_id: { type: Schema.Types.ObjectId, ref: 'SettingCity' },
    vehicleType: { type: String, enum: ['CAR', 'MOTORCYCLE', 'BIKE'], required: true },
    status: { type: String, enum: Object.values(RegisterDeliveryStatus), required: true },
    imageSelfie: { type: [String], required: true },
    imagesCnh: { type: [String] },
    imagesDocuments: { type: [String] },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    message: { type: String },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

RegisterDeliveryManSchema.index({ cpf: 1 });
RegisterDeliveryManSchema.index({ status: 1 });

export const RegisterDeliveryManModel = mongoose.model<IRegisterDeliveryMan>(
  'RegisterDeliveryMan',
  RegisterDeliveryManSchema,
  'registerDeliveryMan'
);
