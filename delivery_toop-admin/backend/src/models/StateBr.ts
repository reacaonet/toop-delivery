import mongoose, { Schema, Document } from 'mongoose';

export interface IStateBr extends Document {
  codigo_uf: number;
  uf: string;
  nome: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

const StateBrSchema = new Schema<IStateBr>(
  {
    codigo_uf: { type: Number, required: true },
    uf: { type: String, required: true },
    nome: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

StateBrSchema.index({ nome: -1 });

export const StateBrModel = mongoose.model<IStateBr>('StateBr', StateBrSchema, 'state_br');
