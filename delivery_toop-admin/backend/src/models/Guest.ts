import mongoose, { Schema, Document } from 'mongoose';

export interface IGuest extends Document {
  device: string;
  location?: { type: string; coordinates: number[] };
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point', required: true },
  coordinates: { type: [Number], required: true },
});

const GuestSchema = new Schema<IGuest>(
  {
    device: { type: String, required: true },
    location: { type: PointSchema, index: '2dsphere' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const { __v: _v, ...rest } = ret;
        return rest;
      },
    },
  }
);

GuestSchema.index({ device: 1 }, { unique: true });

export const GuestModel = mongoose.model<IGuest>('Guest', GuestSchema, 'guest');