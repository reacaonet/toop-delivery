import mongoose, { Schema, Document } from 'mongoose';

export interface ICashbackCampaign extends Document {
  name: string;
  status: boolean;
  startDate: Date;
  endDate?: Date;
  allApp: boolean;
  companies?: mongoose.Types.ObjectId[];
  percent: number;
  amount: number;
  balance: number;
  transaction?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CashbackCampaignSchema = new Schema<ICashbackCampaign>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: Boolean, default: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    allApp: { type: Boolean, default: false },
    companies: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
    percent: { type: Number, required: true, min: 0, max: 100 },
    amount: { type: Number, required: true, min: 0 },
    balance: { type: Number, default: 0 },
    transaction: { type: Schema.Types.ObjectId },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

CashbackCampaignSchema.index({ name: 1 });
CashbackCampaignSchema.index({ status: 1 });
CashbackCampaignSchema.index({ allApp: 1 });
CashbackCampaignSchema.index({ startDate: 1, endDate: 1 });
CashbackCampaignSchema.index({ deletedAt: 1 });

export const CashbackCampaignModel = mongoose.model<ICashbackCampaign>('CashbackCampaign', CashbackCampaignSchema, 'cashback_campaign');
