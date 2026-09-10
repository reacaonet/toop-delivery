import mongoose, { Schema, Document } from 'mongoose';

export const BOOKING_VEHICLE_TYPES = [
  'car',
  'moto',
  'taxi',
  'car_basic',
  'car_comfort',
  'car_black',
  'moto_basic',
  'moto_comfort',
  'moto_black',
] as const;

export type BookingVehicleType = (typeof BOOKING_VEHICLE_TYPES)[number];

export interface IRideCategory extends Document {
  code: string;
  vehicleType: 'car' | 'moto' | 'taxi';
  label: string;
  icon: string;
  description: string;
  multiplier: number;
  basePrice?: number;
  perKm?: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const RideCategorySchema = new Schema<IRideCategory>(
  {
    code: { type: String, required: true, unique: true },
    vehicleType: { type: String, enum: ['car', 'moto', 'taxi'], required: true },
    label: { type: String, required: true },
    icon: { type: String, default: '🚗' },
    description: { type: String, default: '' },
    multiplier: { type: Number, default: 1, min: 0.1, max: 10 },
    basePrice: { type: Number },
    perKm: { type: Number },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

export const RideCategoryModel = mongoose.model<IRideCategory>('RideCategory', RideCategorySchema);

export const DEFAULT_RIDE_CATEGORIES = [
  { code: 'car_basic', vehicleType: 'car', label: 'Carro Básico', icon: '🚗', description: 'Econômico para o dia a dia', multiplier: 1.0, sortOrder: 1 },
  { code: 'car_comfort', vehicleType: 'car', label: 'Confort', icon: '🚘', description: 'Carros mais novos e confortáveis', multiplier: 1.35, sortOrder: 2 },
  { code: 'car_black', vehicleType: 'car', label: 'Black', icon: '🖤', description: 'Experiência premium com motoristas nota alta', multiplier: 1.8, sortOrder: 3 },
  { code: 'moto_basic', vehicleType: 'moto', label: 'Moto Básica', icon: '🏍️', description: 'Rápido e econômico', multiplier: 0.7, sortOrder: 4 },
  { code: 'moto_comfort', vehicleType: 'moto', label: 'Moto Confort', icon: '🏍️', description: 'Motos mais novas e equipadas', multiplier: 0.9, sortOrder: 5 },
  { code: 'moto_black', vehicleType: 'moto', label: 'Moto Black', icon: '🏍️', description: 'Entrega premium de moto', multiplier: 1.2, sortOrder: 6 },
  { code: 'taxi', vehicleType: 'taxi', label: 'Táxi', icon: '🚕', description: 'Táxi tradicional', multiplier: 1.1, sortOrder: 7 },
];