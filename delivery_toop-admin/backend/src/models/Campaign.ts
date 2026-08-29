import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  disseminationVehicle: string;
  initialDate: Date;
  finalDate: Date;
  downloadAndroid: number;
  downloadIos: number;
  note: string;
  image: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    disseminationVehicle: { type: String, required: true },
    initialDate: { type: Date, required: true },
    finalDate: { type: Date, required: true },
    downloadAndroid: { type: Number, required: true, default: 0 },
    downloadIos: { type: Number, required: true, default: 0 },
    note: { type: String, required: true },
    image: { type: [String], default: [] },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CampaignSchema.index({ deletedAt: 1 });
CampaignSchema.index({ initialDate: 1, finalDate: 1 });

export const CampaignModel = mongoose.model<ICampaign>('Campaign', CampaignSchema);
