import mongoose, { Schema, Document } from 'mongoose';

export interface IIndication extends Document {
  person: mongoose.Types.ObjectId;
  personReceive: mongoose.Types.ObjectId;
  referralCode?: string;
  total: number;
  rescued: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IndicationModel = mongoose.Model<IIndication>;

const IndicationSchema = new Schema<IIndication>(
  {
    person: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    personReceive: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    referralCode: { type: String, required: false },
    total: { type: Number, required: true },
    rescued: { type: Boolean, required: true, default: false },
    active: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

IndicationSchema.index({ person: -1 });
IndicationSchema.index({ personReceive: -1 });
IndicationSchema.index({ referralCode: -1 });
IndicationSchema.index({ createdAt: -1 });

export const IndicationModel = mongoose.model<IIndication, IndicationModel>(
  'Indication',
  IndicationSchema,
  'indication'
);
