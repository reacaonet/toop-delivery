import mongoose, { Schema, Document } from 'mongoose';

export interface IChosenDestinations extends Document {
  driver: mongoose.Types.ObjectId;
  location: { type: 'Point'; coordinates: [number, number] };
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ChosenDestinationsModel = mongoose.Model<IChosenDestinations>;

const ChosenDestinationsSchema = new Schema<IChosenDestinations>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    location: {
      type: { type: String, enum: ['Point'] as const, required: true },
      coordinates: { type: [Number], required: true },
    },
    status: { type: Boolean, default: true, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

ChosenDestinationsSchema.index({ location: '2dsphere' });
ChosenDestinationsSchema.index({ driver: -1 });
ChosenDestinationsSchema.index({ createdAt: -1 });

export const ChosenDestinationsModel = mongoose.model<IChosenDestinations, ChosenDestinationsModel>(
  'DriverChosenDestinations',
  ChosenDestinationsSchema,
  'driverChosenDestinations'
);
