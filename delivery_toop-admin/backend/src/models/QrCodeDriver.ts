import mongoose, { Schema, Document } from 'mongoose';

export interface IQrCodeDriver extends Document {
  driver: mongoose.Types.ObjectId;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export type QrCodeDriverModel = mongoose.Model<IQrCodeDriver>;

const QrCodeDriverSchema = new Schema<IQrCodeDriver>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    code: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

QrCodeDriverSchema.index({ driver: -1 });
QrCodeDriverSchema.index({ code: -1 });
QrCodeDriverSchema.index({ createdAt: -1 });

export const QrCodeDriverModel = mongoose.model<IQrCodeDriver, QrCodeDriverModel>(
  'QrCodeDriver',
  QrCodeDriverSchema,
  'qrCodeDriver'
);
