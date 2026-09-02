import mongoose, { Schema, Document } from 'mongoose';

const BankDataSchema = new Schema(
  {
    favoredName: { type: String },
    document: { type: String },
    documentType: { type: String, enum: ['CNPJ', 'CPF'] },
    brazilianBank: { type: Schema.Types.ObjectId, ref: 'SettingBrazilianBanks' },
    bankName: { type: String },
    agency: { type: String },
    agencyDigit: { type: String },
    account: { type: String },
    accountDigit: { type: String },
    typeAccount: { type: String, default: 'CURRENT', enum: ['CURRENT', 'SAVINGS'] },
    pixType: { type: String, default: 'RANDOMKEY', enum: ['CNPJ', 'CPF', 'CELLPHONE', 'EMAIL', 'RANDOMKEY'] },
    pixKey: { type: String },
  },
  { _id: false }
);

const PointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    address: { type: String },
    coordinates: { type: [Number], default: [0, 0] },
    date: { type: Date },
    speed: { type: Number },
  },
  { _id: false }
);

const DynamicsSchema = new Schema(
  {
    timeRange: { type: Number, required: true },
    amoutStart: { type: Number, required: true },
    amoutEnd: { type: Number, required: true },
    percent: { type: Number, required: true },
    ray: { type: Number, required: true },
  },
  { _id: false }
);

const RecalculateSchema = new Schema(
  {
    status: { type: Boolean, default: false },
    timeAbove: { type: Number, default: 2 },
    timeBelow: { type: Number, default: 2 },
    distanceAbove: { type: Number, default: 400 },
    distanceBelow: { type: Number, default: 400 },
  },
  { _id: false }
);

const SettingsRaceSchema = new Schema(
  {
    expiresNewRaceTime: { type: Number, default: 20 },
    dynamics: [DynamicsSchema],
    recalculate: RecalculateSchema,
  },
  { _id: false }
);

const SettingsDriveSchema = new Schema(
  {
    creditEnableMode: { type: Boolean, default: false },
    activePercentService: { type: Boolean, default: false },
    creditPrice: { type: Number, default: 0 },
    creditAmountPerRice: { type: Number, default: 0 },
    creditAmountPerAdditionalStop: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface IFranchise extends Document {
  name: string;
  companyName: string;
  state?: mongoose.Types.ObjectId;
  city?: mongoose.Types.ObjectId;
  email: string;
  phone?: number;
  bankData?: any;
  bankInfo?: any;
  address?: string;
  cep?: number;
  status?: boolean;
  onlyMultiplesOf50?: boolean;
  emergencyPhone?: string;
  images?: string[];
  activateTip?: boolean;
  percentService?: number;
  coin?: string;
  languageDefault?: string;
  serviceDefault?: string;
  fixedservicefee?: number;
  recipient_id?: string;
  pagar_me_bank_id?: string;
  location?: any;
  deletedAt?: Date;
  showPhoneRace?: { driver?: boolean; passenger?: boolean };
  routeSettings?: { showReportCardTravel?: boolean };
  settingsDriver?: any;
  settingsRace?: any;
  createdAt: Date;
  updatedAt: Date;
}

const FranchiseSchema = new Schema<IFranchise>(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    state: { type: Schema.Types.ObjectId, ref: 'SettingState' },
    city: { type: Schema.Types.ObjectId, ref: 'SettingCity' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: Number },
    bankData: BankDataSchema,
    bankInfo: { type: Object },
    address: { type: String },
    cep: { type: Number },
    status: { type: Boolean },
    onlyMultiplesOf50: { type: Boolean },
    emergencyPhone: { type: String, default: '190' },
    images: [{ type: String }],
    activateTip: { type: Boolean, default: true },
    percentService: { type: Number, default: 5, min: 0, max: 100 },
    coin: { type: String, enum: ['R$', '€', '$', '₲', 'Kz'], default: 'R$' },
    languageDefault: { type: String, enum: ['pt-BR', 'pt-PT', 'pt-AO', 'pt'], default: 'pt-BR' },
    serviceDefault: { type: String, enum: ['delivery', 'service', 'drive'], default: 'delivery' },
    fixedservicefee: { type: Number, default: 0 },
    recipient_id: { type: String },
    pagar_me_bank_id: { type: String },
    location: { type: PointSchema },
    deletedAt: { type: Date },
    showPhoneRace: {
      driver: { type: Boolean, default: false },
      passenger: { type: Boolean, default: false },
    },
    routeSettings: {
      showReportCardTravel: { type: Boolean, default: false },
    },
    settingsDriver: SettingsDriveSchema,
    settingsRace: SettingsRaceSchema,
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

FranchiseSchema.index({ status: -1 });
FranchiseSchema.index({ name: 'text' });
FranchiseSchema.index({ name: -1 });
FranchiseSchema.index({ deletedAt: 1 });

export const FranchiseModel = mongoose.model<IFranchise>('Franchise', FranchiseSchema, 'franchise');