import mongoose, { Schema, Document } from 'mongoose';

export interface IAddressCity extends Document {
  codigo_ibge: number;
  nome: string;
  latitude: number;
  longitude: number;
  capital: string;
  codigo_uf: number;
  siafi_id: number;
  ddd: number;
  fuso_horario: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressCitySchema = new Schema<IAddressCity>(
  {
    codigo_ibge: { type: Number, required: true },
    nome: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    capital: { type: String, required: true },
    codigo_uf: { type: Number, required: true },
    siafi_id: { type: Number, required: true },
    ddd: { type: Number, required: true },
    fuso_horario: { type: String, required: true },
  },
  { timestamps: true, collection: 'city_br' }
);

AddressCitySchema.index({ codigo_uf: -1 });
AddressCitySchema.index({ nome: 'text' });
AddressCitySchema.index({ nome: -1 });

export const AddressCityModel = mongoose.model<IAddressCity>('CityBr', AddressCitySchema, 'city_br');
