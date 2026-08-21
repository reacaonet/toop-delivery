import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  companyFeePercentage: number;
  deliverymanFeePercentage: number;
  pushNotifications: boolean;
  maintenanceMode: boolean;
  autoBackup: boolean;
  emailAlerts: boolean;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    companyFeePercentage: { type: Number, default: 5, min: 0, max: 100 },
    deliverymanFeePercentage: { type: Number, default: 2, min: 0, max: 100 },
    pushNotifications: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    autoBackup: { type: Boolean, default: false },
    emailAlerts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model<ISettings>('Settings', SettingsSchema);
