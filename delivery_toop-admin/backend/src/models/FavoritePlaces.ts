import mongoose, { Schema, Document } from 'mongoose';

export interface IFavoritePlaces extends Document {
  passenger: mongoose.Types.ObjectId;
  name: string;
  location: { type: 'Point'; coordinates: [number, number] };
  shortAddress: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FavoritePlacesModel = mongoose.Model<IFavoritePlaces>;

const FavoritePlacesSchema = new Schema<IFavoritePlaces>(
  {
    passenger: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
    name: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'] as const, required: true },
      coordinates: { type: [Number], required: true },
    },
    shortAddress: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

FavoritePlacesSchema.index({ passenger: -1 });
FavoritePlacesSchema.index({ location: '2dsphere' });
FavoritePlacesSchema.index({ createdAt: -1 });

export const FavoritePlacesModel = mongoose.model<IFavoritePlaces, FavoritePlacesModel>(
  'FavoritePlaces',
  FavoritePlacesSchema,
  'favoritePlaces'
);
