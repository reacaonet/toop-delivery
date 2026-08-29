import mongoose, { Schema, Document } from 'mongoose';

export interface IBankData {
  name?: string;
  cpfCnpj?: string;
  city?: string;
  bank?: string;
  agency?: string;
  account?: string;
  iban?: string;
  swift?: string;
  type?: string;
}

const BankDataShema = new Schema(
  {
    name: { type: String },
    cpfCnpj: { type: String },
    city: { type: String },
    bank: { type: String },
    agency: { type: String },
    account: { type: String },
    iban: { type: String },
    swift: { type: String },
    type: { type: String },
  },
  { _id: false }
);

export interface IPreRegistration extends Document {
  ddi?: string;
  phone?: string;
  name?: string;
  email?: string;
  birthDate?: string;
  cpf?: string;
  nif?: string;
  CCfront?: string;
  CCVerse?: string;
  rg?: string;
  genre?: string;
  franchise?: mongoose.Types.ObjectId;
  Region?: string;
  selfiePhoto?: string;
  CNHDocumentPhoto?: string;
  CRLVDocumentPhoto?: string;
  UniqueDocument?: string;
  UniqueDocumentVerse?: string;
  SecurityMotorcycle?: string;
  Security?: string;
  Comercial?: string;
  VehiclePhoto?: string;
  VehicleMatriculation?: string;
  ImageCardFront?: string;
  ImageCardVerse?: string;
  GreenCard?: string;
  bank?: string;
  CriminalRecord?: string;
  ComprovativoInicioAtividade?: string;
  DrivingLicenseFront?: string;
  DrivingLicenseVerse?: string;
  ProofStartOrCompanyCertificate?: string;
  status?: string;
  password?: string;
  token?: string;
  bankData?: IBankData;
  vehicleManufacturer?: string;
  vehicleModel?: string;
  vehicleNameplate?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  terms?: boolean;
  viewStopRegister?: string;
  viewNextRegister?: string;
  application?: mongoose.Types.ObjectId;
  country?: string;
  deletedAt?: Date;
  appversion?: string;
  operationalSystem?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PreRegistrationSchema = new Schema<IPreRegistration>(
  {
    ddi: { type: String },
    phone: { type: String },
    name: { type: String },
    email: { type: String },
    birthDate: { type: String },
    cpf: { type: String },
    nif: { type: String },
    CCfront: { type: String },
    CCVerse: { type: String },
    rg: { type: String },
    genre: { type: String, enum: ['H', 'M', 'O'] },
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    Region: { type: String },
    selfiePhoto: { type: String },
    CNHDocumentPhoto: { type: String },
    CRLVDocumentPhoto: { type: String },
    UniqueDocument: { type: String },
    UniqueDocumentVerse: { type: String },
    SecurityMotorcycle: { type: String },
    Security: { type: String },
    Comercial: { type: String },
    VehiclePhoto: { type: String },
    VehicleMatriculation: { type: String },
    ImageCardFront: { type: String },
    ImageCardVerse: { type: String },
    GreenCard: { type: String },
    bank: { type: String },
    CriminalRecord: { type: String },
    ComprovativoInicioAtividade: { type: String },
    DrivingLicenseFront: { type: String },
    DrivingLicenseVerse: { type: String },
    ProofStartOrCompanyCertificate: { type: String },
    status: { type: String, default: 'PENDENTE' },
    password: { type: String },
    token: { type: String },
    bankData: { type: BankDataShema },
    vehicleManufacturer: { type: String },
    vehicleModel: { type: String },
    vehicleNameplate: { type: String },
    vehicleYear: { type: Number },
    vehicleColor: { type: String },
    terms: { type: Boolean, default: false },
    viewStopRegister: { type: String, default: '' },
    viewNextRegister: { type: String, default: '' },
    application: { type: Schema.Types.ObjectId, ref: 'application' },
    country: { type: String, default: '' },
    deletedAt: { type: Date },
    appversion: { type: String },
    operationalSystem: { type: String },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

PreRegistrationSchema.index({ franchise: 1 });
PreRegistrationSchema.index({ phone: 1 });
PreRegistrationSchema.index({ ddi: 1 });
PreRegistrationSchema.index({ email: 1 });
PreRegistrationSchema.index({ cpf: 1 });
PreRegistrationSchema.index({ nif: 1 });
PreRegistrationSchema.index({ status: 1 });
PreRegistrationSchema.index({ createdAt: 1 });
PreRegistrationSchema.index({ deletedAt: 1 });

export const PreRegistrationModel = mongoose.model<IPreRegistration>('PreRegistration', PreRegistrationSchema);
