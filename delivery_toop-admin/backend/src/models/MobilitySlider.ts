import mongoose, { Schema, Document } from 'mongoose';

export type MobilitySliderTarget = 'passenger' | 'driver';

export interface IMobilitySlider extends Document {
  franchise: mongoose.Types.ObjectId;
  image: string[];
  name: string;
  impressions: string;
  destinationurl: string;
  target?: MobilitySliderTarget;
  status: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMobilitySliderModel extends mongoose.Model<IMobilitySlider> {}

const MobilitySliderSchema = new Schema<IMobilitySlider, IMobilitySliderModel>(
  {
    franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: true },
    image: { type: [String], required: false },
    name: { type: String, required: true },
    impressions: { type: String, required: true },
    destinationurl: { type: String, required: true },
    target: { type: String, enum: ['passenger', 'driver'] },
    status: { type: Boolean, default: false, required: false },
    deletedAt: { type: Date, required: false },
  },
  { timestamps: true, collection: 'mob_slider' }
);

MobilitySliderSchema.index({ franchise: -1 });
MobilitySliderSchema.index({ status: -1 });
MobilitySliderSchema.index({ target: -1 });
MobilitySliderSchema.index({ deletedAt: 1 });

export const MobilitySliderModel = mongoose.model<IMobilitySlider, IMobilitySliderModel>(
  'mob_slider',
  MobilitySliderSchema,
  'mob_slider'
);
