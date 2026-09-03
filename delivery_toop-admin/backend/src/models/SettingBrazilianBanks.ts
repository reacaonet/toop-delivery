import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingBrazilianBanks extends Document {
  compe: string;
  ispb: string;
  document: string;
  long_name: string;
  short_name: string;
  network: string;
  type: string;
  pix_type: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingBrazilianBanksSchema = new Schema<ISettingBrazilianBanks>(
  {
    compe: { type: String, required: true, trim: true },
    ispb: { type: String, required: true, trim: true },
    document: { type: String, required: true, trim: true },
    long_name: { type: String, required: true, trim: true },
    short_name: { type: String, required: true, trim: true },
    network: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    pix_type: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

SettingBrazilianBanksSchema.index({ compe: -1 });
SettingBrazilianBanksSchema.index({ long_name: -1 });
SettingBrazilianBanksSchema.index({ short_name: -1 });

export const SettingBrazilianBanksModel = mongoose.model<ISettingBrazilianBanks>(
  'SettingBrazilianBanks',
  SettingBrazilianBanksSchema,
  'settingBrazilianBanks'
);
