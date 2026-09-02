import mongoose, { Schema, Document } from 'mongoose';

export interface IPerson extends Document {
  franchise?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  cpf?: string;
  city?: mongoose.Types.ObjectId;
  ddi: string;
  phone?: number;
  cellphone?: number;
  birthdate?: Date;
  status?: boolean;
  devices?: any[];
  genre?: 'H' | 'M';
  image?: string;
  deletedAt?: Date;
  referralCode?: string;
  timeZone: string;
  utc: number;
  createdAt: Date;
  updatedAt: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    name: { type: String },
    email: { type: String },
    cpf: { type: String },
    city: { type: Schema.Types.ObjectId, ref: 'SettingCity' },
    ddi: { type: String, default: '+55' },
    phone: { type: Number },
    cellphone: { type: Number },
    birthdate: { type: Date },
    status: { type: Boolean },
    devices: { type: Array },
    genre: { type: String, enum: ['H', 'M'] },
    image: { type: String },
    deletedAt: { type: Date },
    referralCode: { type: String, unique: true, sparse: true },
    timeZone: { type: String, default: 'America/Sao_Paulo' },
    utc: { type: Number, default: -3, min: -13, max: 15 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const { __v: _v, ...rest } = ret;
        return rest;
      },
    },
  }
);

PersonSchema.index({ email: 1 });
PersonSchema.index({ phone: 1 });
PersonSchema.index({ status: 1 });
PersonSchema.index({ name: 1 });
PersonSchema.index({ deletedAt: 1 });
PersonSchema.index({ referralCode: 1 });

export const PersonModel = mongoose.model<IPerson>('Person', PersonSchema, 'person');