import mongoose, { Schema, Document } from 'mongoose';

export interface IFavoriteDrivers extends Document {
  driver: mongoose.Types.ObjectId;
  passenger: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type FavoriteDriversModel = mongoose.Model<IFavoriteDrivers>;

const FavoriteDriversSchema = new Schema<IFavoriteDrivers>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'Passenger', required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { const { __v: _v, ...rest } = ret; return rest; } } }
);

FavoriteDriversSchema.index({ driver: -1 });
FavoriteDriversSchema.index({ passenger: -1 });

export const FavoriteDriversModel = mongoose.model<IFavoriteDrivers, FavoriteDriversModel>(
  'FavoriteDrivers',
  FavoriteDriversSchema,
  'favoriteDrivers'
);
